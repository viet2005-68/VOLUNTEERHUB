import React, { useState, useEffect, useRef, useMemo } from "react";
import Card from "../Card.jsx/Card";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { ScrollText, TriangleAlert, XCircle, CheckCircle } from "lucide-react";
import { getCoordinates } from "../../utils/getCoordinates";
import MapPreview from "../Location/MapPreview";
import {
  useEventDetail,
  useUpdateEvent,
  useCancelEventRegistration,
} from "../../hook/useEvent";
import DropdownSelect from "../Dropdown/DropdownSelect";
import toast from "react-hot-toast";
import { useOutletContext } from "react-router-dom";
import eventSchema from "../../validation/eventSchema";
import { useProvinces, useDistricts } from "../../hook/useVietnamLocations";
import JoinQrPanel from "./JoinQrPanel";
import { BADGE_CATALOG, BADGE_OPTIONS } from "../../constant/badgeCatalog";

const categoryOptions = [
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "environment", label: "Environment" },
  { value: "animals", label: "Animals" },
  { value: "other", label: "Other" },
];

function OverviewEventManager() {
  const { eventId } = useOutletContext();
  const [showMore, setShowMore] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const descriptionRef = useRef(null);

  // Fetch event details
  const {
    data: eventData,
    isLoading,
    error,
    refetch,
  } = useEventDetail(eventId);
  const updateEventMutation = useUpdateEvent({
    onSuccess: () => {
      setIsEditMode(false);
      refetch();
    },
  });

  const cancelRegistrationMutation = useCancelEventRegistration({
    onSuccess: () => {
      refetch();
    },
  });

  // Vietnam location hooks
  const {
    provinces,
    getProvinceByName,
    isLoading: provincesLoading,
  } = useProvinces();

  const selectedProvince = useMemo(
    () => getProvinceByName(editData?.province),
    [getProvinceByName, editData?.province]
  );

  const provinceCode = selectedProvince?.code;
  const { districts, isLoading: districtsLoading } = useDistricts(provinceCode);

  const provinceOptions = useMemo(
    () =>
      (provinces || []).map((p) => ({
        value: p.name,
        label: p.name_with_type || p.name,
      })),
    [provinces]
  );

  const districtOptions = useMemo(
    () =>
      (districts || []).map((d) => ({
        value: d.name,
        label: d.name_with_type || d.name,
      })),
    [districts]
  );

  // Initialize edit data when event data loads
  useEffect(() => {
    if (eventData && !editData) {
      setEditData({
        name: eventData.name || "",
        description: eventData.description || "",
        categoryName: eventData.category?.name || "",
        startTime: eventData.startTime ? eventData.startTime.slice(0, 16) : "",
        endTime: eventData.endTime ? eventData.endTime.slice(0, 16) : "",
        capacity: eventData.capacity || "",
        registrationDeadline: eventData.registrationDeadline
          ? eventData.registrationDeadline.slice(0, 16)
          : "",
        street: eventData.address?.street || "",
        district: eventData.address?.district || "",
        province: eventData.address?.province || "",
        completionBadgeId: eventData.completionBadgeId
          ? String(eventData.completionBadgeId)
          : "",
      });
    }
  }, [eventData, editData]);
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });

  // Build location string from eventData or editData
  const locationString =
    isEditMode && editData
      ? [editData.street, editData.district, editData.province]
          .filter(Boolean)
          .join(", ")
      : eventData
      ? [
          eventData.address?.street,
          eventData.address?.district,
          eventData.address?.province,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

  useEffect(() => {
    if (descriptionRef.current && eventData?.description) {
      const lineHeight = parseInt(
        window.getComputedStyle(descriptionRef.current).lineHeight
      );
      const maxHeight = lineHeight * 4;
      const actualHeight = descriptionRef.current.scrollHeight;
      setShouldShowButton(actualHeight > maxHeight);
    }
  }, [eventData?.description]);

  useEffect(() => {
    let isMounted = true;

    const fetchCoordinates = async () => {
      if (!locationString) return;

      try {
        const coords = await getCoordinates(locationString);
        if (isMounted && coords) {
          setCoordinates(coords);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Không thể lấy tọa độ:", error);
        }
      }
    };

    fetchCoordinates();

    return () => {
      isMounted = false;
    };
  }, [locationString]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setValidationErrors({});
    // Reset edit data to original
    if (eventData) {
      setEditData({
        name: eventData.name || "",
        description: eventData.description || "",
        categoryName: eventData.category?.name || "",
        startTime: eventData.startTime ? eventData.startTime.slice(0, 16) : "",
        endTime: eventData.endTime ? eventData.endTime.slice(0, 16) : "",
        capacity: eventData.capacity || "",
        registrationDeadline: eventData.registrationDeadline
          ? eventData.registrationDeadline.slice(0, 16)
          : "",
        street: eventData.address?.street || "",
        district: eventData.address?.district || "",
        province: eventData.address?.province || "",
        completionBadgeId: eventData.completionBadgeId
          ? String(eventData.completionBadgeId)
          : "",
      });
    }
  };

  const handleSave = async () => {
    if (!editData) return;

    // Clear previous errors
    setValidationErrors({});

    // Normalize categoryName to lowercase
    const normalizedCategoryName = editData.categoryName.toLowerCase();

    // Prepare validation data
    const validationData = {
      name: editData.name,
      description: editData.description,
      categoryName: normalizedCategoryName,
      startTime: editData.startTime ? new Date(editData.startTime) : null,
      endTime: editData.endTime ? new Date(editData.endTime) : null,
      capacity: editData.capacity ? parseInt(editData.capacity) : "",
      completionBadgeId: editData.completionBadgeId,
      registrationDeadline: editData.registrationDeadline
        ? new Date(editData.registrationDeadline)
        : null,
      street: editData.street,
      district: editData.district,
      province: editData.province,
    };

    // Validate with schema
    try {
      await eventSchema.validate(validationData, { abortEarly: false });
    } catch (error) {
      // Collect all validation errors
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setValidationErrors(errors);

      // Show first error as toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError || "Please fix validation errors");
      return;
    }

    // Backend expects LocalDateTime without seconds; trim to yyyy-MM-ddTHH:mm
    const payload = {
      name: editData.name,
      description: editData.description,
      categoryName: normalizedCategoryName,
      startTime: editData.startTime,
      endTime: editData.endTime,
      capacity: parseInt(editData.capacity),
      completionBadgeId: editData.completionBadgeId
        ? Number(editData.completionBadgeId)
        : undefined,
      registrationDeadline: editData.registrationDeadline,
      address: {
        street: editData.street,
        district: editData.district,
        province: editData.province,
      },
    };

    console.log("=== PAYLOAD BEFORE PUT ===");
    console.log("Event ID:", eventId);
    console.log("Payload (JSON):", JSON.stringify(payload, null, 2));
    console.log("DateTime formats:", {
      start: editData.startTime,
      end: editData.endTime,
      deadline: editData.registrationDeadline,
    });

    updateEventMutation.mutate({ eventId, payload });
  };

  const handleInputChange = (field, value) => {
    setEditData((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset district when province changes
      if (field === "province" && value !== prev.province) {
        updated.district = "";
      }

      return updated;
    });
  };

  // Check if registration is closed
  const isRegistrationClosed = () => {
    if (!eventData?.registrationDeadline) return false;
    const deadline = new Date(eventData.registrationDeadline);
    const now = new Date();
    return deadline < now;
  };

  const handleCloseRegistration = async () => {
    if (isRegistrationClosed()) {
      toast.info("Registration is already closed for this event.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to close registration for "${eventData.name}"?\n\n` +
        `No new volunteers will be able to register after this action.`
    );

    if (!confirmed) return;

    try {
      await cancelRegistrationMutation.mutateAsync(eventId);
    } catch (error) {
      console.error("Failed to close registration:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-deep-forest/55">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading event: {error.message}</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-deep-forest/55">No event data found</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6 font-clash-grotesk">
      <JoinQrPanel eventId={eventId} eventStatus={eventData?.status} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-deep-forest/20 bg-pale-canvas p-0 shadow-[0_18px_45px_rgba(0,82,45,0.10)]">
            <div className="flex flex-col gap-6 p-5 sm:p-6">
              {/* Header */}
              <div className="flex flex-col gap-4 rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-beni text-6xl uppercase leading-[0.75] text-deep-forest sm:text-7xl">
                    Event Details
                  </h3>
                  <p className="text-sm font-medium text-deep-forest/65">
                    {isEditMode
                      ? "Edit event information"
                      : "Complete information about this event"}
                  </p>
                </div>
                {!isEditMode && (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-deep-forest px-5 py-3 text-sm font-bold text-pale-canvas transition hover:bg-deep-forest/90"
                  >
                    <FaEdit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <dl className="space-y-6">
                {/* Event Name */}
                <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                  <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                    Event Name *
                  </dt>
                  {isEditMode ? (
                    <>
                      <input
                        type="text"
                        value={editData?.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          validationErrors.name
                            ? "border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-deep-forest/15 focus:border-deep-forest focus:ring-deep-forest/20 bg-pale-canvas"
                        }`}
                        placeholder="Enter event name"
                      />
                      {validationErrors.name && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <span className="text-red-500">⚠</span>
                          {validationErrors.name}
                        </p>
                      )}
                    </>
                  ) : (
                    <dd className="text-lg font-semibold text-deep-forest">
                      {eventData.name}
                    </dd>
                  )}
                </div>

                {/* Category */}
                <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                  <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                    Category *
                  </dt>
                  {isEditMode ? (
                    <>
                      <DropdownSelect
                        value={editData?.categoryName || ""}
                        onChange={(value) =>
                          handleInputChange("categoryName", value)
                        }
                        options={categoryOptions}
                        placeholder="Select category"
                        className={`w-full ${
                          validationErrors.categoryName ? "border-red-500" : ""
                        }`}
                      />
                      {validationErrors.categoryName && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <span className="text-red-500">⚠</span>
                          {validationErrors.categoryName}
                        </p>
                      )}
                    </>
                  ) : (
                    <dd className="text-base font-medium text-deep-forest capitalize inline-flex items-center gap-2">
                      <span className="px-3 py-1 bg-deep-forest/10 text-deep-forest rounded-full text-sm font-semibold">
                        {eventData.category?.name}
                      </span>
                    </dd>
                  )}
                </div>

                {/* Completion Badge */}
                <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                  <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                    Completion Badge
                  </dt>
                  {isEditMode ? (
                    <DropdownSelect
                      value={editData?.completionBadgeId || ""}
                      onChange={(value) =>
                        handleInputChange("completionBadgeId", value)
                      }
                      options={BADGE_OPTIONS}
                      placeholder="Select badge awarded on completion"
                      className="w-full"
                    />
                  ) : (
                    <dd className="text-base font-medium text-deep-forest">
                      {BADGE_CATALOG.find(
                        (badge) => badge.id === Number(eventData.completionBadgeId)
                      )?.title || "No badge selected"}
                    </dd>
                  )}
                </div>

                {/* Status */}
                <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                  <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                    Status
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
                        eventData.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : eventData.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : eventData.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-deep-forest/10 text-deep-forest"
                      }`}
                    >
                      {eventData.status}
                    </span>
                  </dd>
                </div>

                {/* Registration Deadline */}
                <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                  <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                    Registration Deadline *
                  </dt>
                  {isEditMode ? (
                    <>
                      <input
                        type="datetime-local"
                        value={editData?.registrationDeadline || ""}
                        onChange={(e) =>
                          handleInputChange(
                            "registrationDeadline",
                            e.target.value
                          )
                        }
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          validationErrors.registrationDeadline
                            ? "border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-deep-forest/15 focus:border-deep-forest focus:ring-deep-forest/20 bg-pale-canvas"
                        }`}
                      />
                      {validationErrors.registrationDeadline && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <span className="text-red-500">⚠</span>
                          {validationErrors.registrationDeadline}
                        </p>
                      )}
                    </>
                  ) : (
                    <dd className="text-base font-medium text-deep-forest">
                      {new Date(eventData.registrationDeadline).toLocaleString(
                        "en-US",
                        {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        }
                      )}
                    </dd>
                  )}
                </div>

                {/* Time Range */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                    <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                      Start Time *
                    </dt>
                    {isEditMode ? (
                      <>
                        <input
                          type="datetime-local"
                          value={editData?.startTime || ""}
                          onChange={(e) =>
                            handleInputChange("startTime", e.target.value)
                          }
                          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            validationErrors.startTime
                              ? "border-red-500 focus:ring-red-500 bg-red-50"
                              : "border-deep-forest/15 focus:border-deep-forest focus:ring-deep-forest/20 bg-pale-canvas"
                          }`}
                        />
                        {validationErrors.startTime && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <span className="text-red-500">⚠</span>
                            {validationErrors.startTime}
                          </p>
                        )}
                      </>
                    ) : (
                      <dd className="text-base font-medium text-deep-forest">
                        {new Date(eventData.startTime).toLocaleString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </dd>
                    )}
                  </div>
                  <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                    <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                      End Time *
                    </dt>
                    {isEditMode ? (
                      <>
                        <input
                          type="datetime-local"
                          value={editData?.endTime || ""}
                          onChange={(e) =>
                            handleInputChange("endTime", e.target.value)
                          }
                          className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                            validationErrors.endTime
                              ? "border-red-500 focus:ring-red-500 bg-red-50"
                              : "border-deep-forest/15 focus:border-deep-forest focus:ring-deep-forest/20 bg-pale-canvas"
                          }`}
                        />
                        {validationErrors.endTime && (
                          <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                            <span className="text-red-500">⚠</span>
                            {validationErrors.endTime}
                          </p>
                        )}
                      </>
                    ) : (
                      <dd className="text-base font-medium text-deep-forest">
                        {new Date(eventData.endTime).toLocaleString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </dd>
                    )}
                  </div>
                </div>
                {/* Capacity */}
                <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                  <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-2">
                    Maximum Capacity *
                  </dt>
                  {isEditMode ? (
                    <>
                      <input
                        type="number"
                        value={editData?.capacity || ""}
                        onChange={(e) =>
                          handleInputChange("capacity", e.target.value)
                        }
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                          validationErrors.capacity
                            ? "border-red-500 focus:ring-red-500 bg-red-50"
                            : "border-deep-forest/15 focus:border-deep-forest focus:ring-deep-forest/20 bg-pale-canvas"
                        }`}
                        placeholder="Maximum volunteers"
                        min="1"
                      />
                      {validationErrors.capacity && (
                        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <span className="text-red-500">⚠</span>
                          {validationErrors.capacity}
                        </p>
                      )}
                    </>
                  ) : (
                    <dd className="text-base font-medium text-deep-forest">
                      <span className="text-3xl font-bold text-deep-forest">
                        {eventData.capacity}
                      </span>
                      <span className="text-deep-forest/65 ml-2">volunteers</span>
                    </dd>
                  )}
                </div>

                {/* Location */}
                <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                  <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-3">
                    Location *
                  </dt>
                  {isEditMode ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Province Dropdown */}
                        <div>
                          <label className="text-xs font-medium text-deep-forest/65 mb-1.5 block">
                            Province
                          </label>
                          <DropdownSelect
                            value={editData?.province || ""}
                            onChange={(value) =>
                              handleInputChange("province", value)
                            }
                            options={provinceOptions}
                            placeholder={
                              provincesLoading
                                ? "Loading..."
                                : "Select province"
                            }
                            className={`w-full ${
                              validationErrors.province ? "border-red-500" : ""
                            }`}
                          />
                          {validationErrors.province && (
                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                              <span className="text-red-500">⚠</span>
                              {validationErrors.province}
                            </p>
                          )}
                        </div>

                        {/* District Dropdown */}
                        <div>
                          <label className="text-xs font-medium text-deep-forest/65 mb-1.5 block">
                            District
                          </label>
                          <DropdownSelect
                            value={editData?.district || ""}
                            onChange={(value) =>
                              handleInputChange("district", value)
                            }
                            options={districtOptions}
                            placeholder={
                              !provinceCode
                                ? "Select province first"
                                : districtsLoading
                                ? "Loading..."
                                : "Select district"
                            }
                            className={`w-full ${
                              validationErrors.district ? "border-red-500" : ""
                            }`}
                            disabled={
                              !provinceCode ||
                              districtsLoading ||
                              districtOptions.length === 0
                            }
                          />
                          {validationErrors.district && (
                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                              <span className="text-red-500">⚠</span>
                              {validationErrors.district}
                            </p>
                          )}
                        </div>

                        {/* Street Input */}
                        <div>
                          <label className="text-xs font-medium text-deep-forest/65 mb-1.5 block">
                            Street
                          </label>
                          <input
                            type="text"
                            value={editData?.street || ""}
                            onChange={(e) =>
                              handleInputChange("street", e.target.value)
                            }
                            placeholder="123 Beach St"
                            className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                              validationErrors.street
                                ? "border-red-500 focus:ring-red-500 bg-red-50"
                                : "border-deep-forest/15 focus:border-deep-forest focus:ring-deep-forest/20 bg-pale-canvas"
                            }`}
                          />
                          {validationErrors.street && (
                            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                              <span className="text-red-500">⚠</span>
                              {validationErrors.street}
                            </p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <dd className="text-base font-medium text-deep-forest flex items-start gap-2">
                      <svg
                        className="w-5 h-5 text-deep-forest/40 mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span>{locationString}</span>
                    </dd>
                  )}
                </div>
              </dl>

              {/* Description */}
              <div className="rounded-lg border border-deep-forest/10 bg-white p-4 shadow-sm">
                <dt className="text-xs font-bold uppercase leading-[1] text-deep-forest/55 mb-3">
                  Description *
                </dt>
                {isEditMode ? (
                  <>
                    <textarea
                      value={editData?.description || ""}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                        validationErrors.description
                          ? "border-red-500 focus:ring-red-500 bg-red-50"
                          : "border-deep-forest/15 focus:border-deep-forest focus:ring-deep-forest/20 bg-pale-canvas"
                      }`}
                      placeholder="Describe your event in detail..."
                    />
                    {validationErrors.description && (
                      <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {validationErrors.description}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      ref={descriptionRef}
                      className={`text-deep-forest/75 leading-relaxed transition-all duration-300 overflow-hidden ${
                        showMore ? "" : "line-clamp-4"
                      }`}
                    >
                      {eventData.description}
                    </div>
                    {shouldShowButton && (
                      <button
                        onClick={() => setShowMore(!showMore)}
                        className="mt-3 text-deep-forest hover:text-deep-forest/75 font-semibold text-sm focus:outline-none transition-colors inline-flex items-center gap-1"
                      >
                        {showMore ? (
                          <>
                            Show less
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </>
                        ) : (
                          <>
                            Show more
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Action Buttons in Edit Mode */}
              {isEditMode && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-deep-forest/10">
                  <button
                    onClick={handleCancel}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-deep-forest/20 rounded-lg text-deep-forest/75 font-semibold hover:bg-deep-forest/5 hover:border-deep-forest/35 transition-all"
                  >
                    <FaTimes className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateEventMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-deep-forest text-pale-canvas rounded-lg font-bold hover:bg-deep-forest/90 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-deep-forest"
                  >
                    {updateEventMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>
        <div className="flex flex-col gap-6">
          {/* Quick Actions Card */}
          <Card className="border-deep-forest/20 bg-pale-canvas shadow-[0_14px_34px_rgba(0,82,45,0.08)]">
            <div className="flex flex-col gap-4">
              <h4 className="text-xl font-bold text-deep-forest mb-2">
                Quick Actions
              </h4>

              {/* Close Registration Button */}
              <button
                onClick={handleCloseRegistration}
                disabled={
                  isRegistrationClosed() || cancelRegistrationMutation.isPending
                }
                className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all font-medium ${
                  isRegistrationClosed()
                    ? "bg-gray-100 text-deep-forest/55 cursor-not-allowed"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300"
                } disabled:opacity-60`}
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
                  {isRegistrationClosed() ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">
                    {cancelRegistrationMutation.isPending
                      ? "Closing..."
                      : isRegistrationClosed()
                      ? "Registration Closed"
                      : "Close Registration"}
                  </div>
                  {!isRegistrationClosed() && (
                    <div className="text-xs text-orange-600 mt-0.5">
                      Stop accepting new volunteers
                    </div>
                  )}
                </div>
              </button>

              {/* Delete Event Button */}
              <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200 hover:border-red-300 transition-all font-medium">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
                  <TriangleAlert className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">Delete Event</div>
                  <div className="text-xs text-red-600 mt-0.5">
                    Permanently remove this event
                  </div>
                </div>
              </button>

              {/* View Public Event Button */}
              <button className="flex items-center gap-3 w-full p-4 rounded-xl bg-deep-forest/5 text-deep-forest hover:bg-deep-forest/10 border-2 border-deep-forest/15 hover:border-deep-forest/25 transition-all font-medium">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white">
                  <ScrollText className="w-5 h-5 text-deep-forest" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold">View Public Event</div>
                  <div className="text-xs text-deep-forest/65 mt-0.5">
                    See how volunteers see it
                  </div>
                </div>
              </button>
            </div>
          </Card>

          {/* Location Map Card */}
          <Card className="border-deep-forest/20 bg-pale-canvas shadow-[0_14px_34px_rgba(0,82,45,0.08)]">
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-xl font-bold text-deep-forest mb-1">
                  Event Location
                </h4>
                <p className="text-sm text-deep-forest/55 flex items-start gap-2">
                  <svg
                    className="w-4 h-4 text-deep-forest/40 mt-0.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{locationString}</span>
                </p>
              </div>
              <div className="rounded-xl overflow-hidden border border-deep-forest/10">
                <MapPreview
                  lat={coordinates?.lat || null}
                  lon={coordinates?.lon || null}
                  address={locationString}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default OverviewEventManager;
