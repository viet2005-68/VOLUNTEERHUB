import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Plus,
  Search,
  Ban,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
} from "lucide-react";
import Pagination from "@mui/material/Pagination";
import EventManagerCard from "../../components/Project/eventManagerCard";
import { EVENT_STATUS, STATUS_CONFIG } from "../../constant/eventStatus";
import DropdownSelect from "../../components/Dropdown/DropdownSelect";
import CreateEvent from "../../components/Form/CreateEvent";
import useClickOutside from "../../hook/ClickOutside";
import {
  useOwnedEventsPagination,
  useSearchEventByNameForManager,
  useEventDetail,
  useUpdateEvent,
} from "../../hook/useEvent";
import MobileManageCard from "../../components/Project/MobileManageCard";
import { useNavigate } from "react-router-dom";
import { useProvinces, useDistricts } from "../../hook/useVietnamLocations";
import { showSuccess } from "../../utils/confirmDialog";

const PAGE_SIZE = 6;

function EventManager() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const isFirstLoad = useRef(true);
  // New: Edit modal state
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Vietnam locations hooks
  const {
    provinces,
    getProvinceByName,
    isLoading: provincesLoading,
  } = useProvinces();

  const selectedProvince = useMemo(
    () => (editData?.province ? getProvinceByName(editData.province) : null),
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

  // Reset page when filter or search changes
  useEffect(() => {
    setPage(0);
  }, [filterStatus, searchTerm]);

  // Check if in search mode
  const isSearchMode = searchTerm.trim().length > 0;

  // Hook cho filtered pagination (khi không search)
  const filterQuery = useOwnedEventsPagination({
    pageNum: page,
    pageSize: PAGE_SIZE,
    status: filterStatus === "all" ? undefined : filterStatus,
  });

  // Hook cho search by name (khi có search query)
  const searchQuery = useSearchEventByNameForManager({
    keyword: searchTerm,
    pageNum: page,
    pageSize: PAGE_SIZE,
    enabled: isSearchMode,
  });

  // Chọn data source dựa trên mode
  const activeQuery = isSearchMode ? searchQuery : filterQuery;
  const { data, isLoading, isFetching, isError, error } = activeQuery;

  // Track first successful load
  useEffect(() => {
    if (data && isFirstLoad.current) {
      isFirstLoad.current = false;
    }
  }, [data]);

  // Only show full loading on very first load
  const showFullLoading = isLoading && isFirstLoad.current;

  useEffect(() => {
    if (openCreateForm || openEditForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openCreateForm, openEditForm]);

  const handleCreateNew = () => {
    setOpenCreateForm(true);
  };
  const modalRef = useClickOutside(() => {
    setOpenCreateForm(false);
  });
  // New: edit modal ref
  const editModalRef = useClickOutside(() => {
    setOpenEditForm(false);
    setImageFile(null);
    setPreviewImage(null);
    setIsInitialLoad(true);
  });

  const handlePageChange = (event, value) => {
    setPage(value - 1); // Convert from 1-based (UI) to 0-based (API)
  };

  const handleCancelEvent = async (id) => {
    console.log(`Cancelling event ${id}...`);

    // Simulate API call
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.1) {
          resolve();
        } else {
          reject(new Error("Network error"));
        }
      }, 1000);
    });

    // TODO: Replace with real API call
    // await cancelEvent(id);

    console.log(`✅ Event cancelled successfully`);
  };

  // Edit handler: open modal and load details
  const handleEdit = (id) => {
    setSelectedEventId(id);
    setOpenEditForm(true);
  };

  const handleView = (id) => {
    // TODO: Navigate to event detail page\
    navigate(`/dashboard/eventmanager/${id}/overview`);
  };

  // Fetch event detail for editing
  const {
    data: editEventData,
    isLoading: isLoadingEdit,
    error: editError,
  } = useEventDetail(selectedEventId, {
    enabled: !!selectedEventId && openEditForm,
  });

  // Initialize edit data when event data loads
  useEffect(() => {
    if (editEventData && openEditForm) {
      setEditData({
        name: editEventData.name || "",
        description: editEventData.description || "",
        categoryName: editEventData.category?.name || "",
        startTime: editEventData.startTime
          ? editEventData.startTime.slice(0, 16)
          : "",
        endTime: editEventData.endTime
          ? editEventData.endTime.slice(0, 16)
          : "",
        capacity: editEventData.capacity || "",
        registrationDeadline: editEventData.registrationDeadline
          ? editEventData.registrationDeadline.slice(0, 16)
          : "",
        street: editEventData.address?.street || "",
        district: editEventData.address?.district || "",
        province: editEventData.address?.province || "",
        status: editEventData.status || "",
      });
      setIsInitialLoad(true); // Mark as initial load
    }
  }, [editEventData, openEditForm]);

  const updateEventMutation = useUpdateEvent({
    onSuccess: async () => {
      setOpenEditForm(false);
      setImageFile(null);
      setPreviewImage(null);
      setIsInitialLoad(true);
      // Refresh lists
      filterQuery.refetch?.();
      searchQuery.refetch?.();
      // Show success message
      await showSuccess(
        "Event Updated!",
        "Your event has been updated successfully."
      );
    },
  });

  const handleInputChange = (field, value) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset district when province changes (but not on initial load)
  useEffect(() => {
    if (editData?.province && openEditForm) {
      if (isInitialLoad) {
        // Skip reset on initial load, just mark as no longer initial
        setIsInitialLoad(false);
      } else {
        // User manually changed province, reset district
        setEditData((prev) => ({ ...prev, district: "" }));
      }
    }
  }, [editData?.province, openEditForm, isInitialLoad]);

  const categoryOptions = [
    { value: "health", label: "Health" },
    { value: "education", label: "Education" },
    { value: "environment", label: "Environment" },
    { value: "animals", label: "Animals" },
    { value: "other", label: "Other" },
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setPreviewImage(null);
  };

  const handleSave = () => {
    if (!selectedEventId || !editData) return;

    const payload = {
      name: editData.name,
      description: editData.description,
      categoryName: (editData.categoryName || "").toLowerCase(),
      startTime: editData.startTime,
      endTime: editData.endTime,
      capacity: parseInt(editData.capacity),
      registrationDeadline: editData.registrationDeadline,
      address: {
        street: editData.street,
        district: editData.district,
        province: editData.province,
      },
    };

    const payloadToSend = imageFile
      ? { eventRequest: payload, imageFile }
      : { eventRequest: payload };

    updateEventMutation.mutate({
      eventId: selectedEventId,
      payload: payloadToSend,
    });
  };

  if (showFullLoading) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-sm font-bold leading-[1.2] text-deep-forest/70">
            Loading events...
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-8">
        <div className="flex h-64 items-center justify-center">
          <div className="rounded-[10px] bg-ash-whisper px-5 py-3 text-sm font-bold leading-[1.2] text-foudre-pink">
            Error loading events: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 rounded-[25px] border-2 border-ash-whisper bg-pale-canvas p-6 text-deep-forest md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-beni text-[56px] font-black uppercase leading-[0.75] text-deep-forest md:text-[80px]">
          {isSearchMode ? `Search: "${searchTerm}"` : "Your Events"}
        </h2>
        <p className="text-base font-medium leading-[1.2] text-deep-forest/70">
          {isSearchMode
            ? `Found ${data?.meta?.totalElements || 0} events`
            : "Manage all your volunteer opportunities"}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-deep-forest/45" />
          <input
            type="text"
            placeholder="Search events by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-[10px] border-2 border-ash-whisper bg-white px-4 py-4 pl-12 pr-10 text-sm font-medium leading-[1.2] text-deep-forest placeholder:text-deep-forest/55 focus:border-foudre-pink focus:outline-none"
          />
          {/* Loading indicator for search */}
          {isSearchMode && isFetching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-foudre-pink border-t-transparent" />
            </div>
          )}
        </div>

        {/* Filter & Create */}
        <div className="flex items-center justify-between gap-3 sm:justify-start">
          <DropdownSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "all", label: "All Status" },
              { value: EVENT_STATUS.PENDING, label: "Pending" },
              { value: EVENT_STATUS.APPROVED, label: "Approved" },
              { value: EVENT_STATUS.CANCELLED, label: "Rejected" },
            ]}
            className="w-[160px]"
          />

          <button
            onClick={() => setOpenCreateForm(true)}
            className="flex items-center gap-2 rounded-[10px] bg-deep-forest px-5 py-4 text-sm font-bold leading-[0.85] text-pale-canvas transition-colors hover:bg-foudre-pink max-sm:text-xs"
          >
            <Plus className="h-5 w-5" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="relative max-lg:hidden overflow-x-auto rounded-[20px] border-2 border-ash-whisper bg-white">
        <table className="w-full">
          <thead>
            <tr className="bg-ash-whisper/70">
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Event
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Date & Time
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Volunteers
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Status
              </th>
              <th className="px-6 py-4 text-left text-sm font-bold leading-[1.2] text-deep-forest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={
              isFetching
                ? "opacity-50 transition-opacity"
                : "transition-opacity"
            }
          >
            {data?.data && data.data.length > 0 ? (
              data.data.map((event) => (
                <EventManagerCard
                  key={event.id}
                  data={event}
                  onCancelEvent={handleCancelEvent}
                  onEdit={handleEdit}
                  onView={handleView}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm font-medium leading-[1.2] text-deep-forest/65">
                      No events found
                    </p>
                    <button
                      onClick={handleCreateNew}
                      className="rounded-[10px] bg-bubblegum-blush px-5 py-3 text-sm font-bold leading-[0.85] text-deep-forest hover:bg-foudre-pink hover:text-pale-canvas"
                    >
                      Create your first event
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards - Mobile only */}
      <div className="lg:hidden">
        {data?.data && data.data.length > 0 ? (
          data.data.map((event) => (
            <MobileManageCard
              key={event.id}
              data={event}
              onCancelEvent={handleCancelEvent}
              onEdit={handleEdit}
              onView={handleView}
            />
          ))
        ) : (
          <div className="rounded-[20px] border-2 border-ash-whisper bg-white px-6 py-12 text-center">
            <p className="text-sm font-medium leading-[1.2] text-deep-forest/65">
              No events found
            </p>
            <button
              onClick={handleCreateNew}
              className="mt-3 rounded-[10px] bg-bubblegum-blush px-5 py-3 text-sm font-bold leading-[0.85] text-deep-forest hover:bg-foudre-pink hover:text-pale-canvas"
            >
              Create your first event
            </button>
          </div>
        )}
      </div>

      {/* Pagination & Stats Footer */}
      {data?.data && data.data.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 border-t-2 border-ash-whisper pt-5 sm:flex-row">
          <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
            Showing {data.data.length} of {data.meta?.totalElements || 0} events
          </p>
          <Pagination
            count={data.meta?.totalPages || 0}
            page={page + 1}
            onChange={handlePageChange}
            sx={{
              "& .MuiPaginationItem-root": {
                "&.Mui-selected": {
                  backgroundColor: "#00522d",
                  color: "#fff8f6",
                  "&:hover": { backgroundColor: "#db3c8a" },
                },
              },
            }}
          />
        </div>
      )}

      {openCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            ref={modalRef}
            className="w-full max-w-3xl max-h-[calc(100vh-2rem)] flex flex-col"
          >
            <div className="relative flex max-h-full flex-col overflow-hidden rounded-[25px] border-2 border-ash-whisper bg-pale-canvas">
              <button
                onClick={() => setOpenCreateForm(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-ash-whisper p-2 text-deep-forest transition hover:bg-foudre-pink hover:text-pale-canvas"
                aria-label="Close"
              >
                <span className="text-xl font-bold leading-none">
                  <X />
                </span>
              </button>
              <div className="overflow-y-auto">
                <CreateEvent
                  onSuccess={() => setOpenCreateForm(false)}
                  onCancel={() => setOpenCreateForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {openEditForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div
            ref={editModalRef}
            className="w-full max-w-3xl max-h-[calc(100vh-2rem)] flex flex-col"
          >
            <div className="relative flex max-h-full flex-col overflow-hidden rounded-[25px] border-2 border-ash-whisper bg-pale-canvas">
              <button
                onClick={() => {
                  setOpenEditForm(false);
                  setIsInitialLoad(true);
                }}
                className="absolute right-4 top-4 z-10 rounded-full bg-ash-whisper p-2 text-deep-forest transition hover:bg-foudre-pink hover:text-pale-canvas"
                aria-label="Close edit form"
              >
                <span className="text-xl font-bold leading-none">
                  <X />
                </span>
              </button>

              <div className="overflow-y-auto p-6 text-deep-forest">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="font-beni text-[46px] font-black uppercase leading-[0.75] text-deep-forest">
                      Edit Event
                    </p>
                    <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
                      Update details of your event
                    </p>
                  </div>
                </div>

                {isLoadingEdit && (
                  <div className="flex h-32 items-center justify-center">
                    <p className="text-sm font-medium leading-[1.2] text-deep-forest/70">
                      Loading event details...
                    </p>
                  </div>
                )}

                {editError && (
                  <div className="flex h-32 items-center justify-center">
                    <p className="rounded-[10px] bg-ash-whisper px-5 py-3 text-sm font-bold leading-[1.2] text-foudre-pink">
                      Error loading event: {editError.message}
                    </p>
                  </div>
                )}

                {editData && (
                  <div className="space-y-5">
                    {/* Event Name and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-900">
                          Event Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter event title"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-900">
                          Category <span className="text-red-500">*</span>
                        </label>
                        <DropdownSelect
                          value={editData.categoryName}
                          onChange={(value) =>
                            handleInputChange("categoryName", value)
                          }
                          options={categoryOptions}
                          placeholder="Select category"
                          className="w-full"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-900">
                        Status
                      </label>
                      <div>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            editData.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : editData.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : editData.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {editData.status}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-900">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={editData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Describe your volunteer opportunity..."
                      />
                    </div>

                    {/* Start Time and End Time */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-900">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editData.startTime}
                          onChange={(e) =>
                            handleInputChange("startTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-900">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editData.endTime}
                          onChange={(e) =>
                            handleInputChange("endTime", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Max Volunteers and Registration Deadline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-900">
                          Max Volunteers <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={editData.capacity}
                          min="1"
                          onChange={(e) =>
                            handleInputChange("capacity", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Maximum volunteers"
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-gray-900">
                          Registration Deadline{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={editData.registrationDeadline}
                          onChange={(e) =>
                            handleInputChange(
                              "registrationDeadline",
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-900">
                        Location <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-gray-600">
                            Province
                          </label>
                          <DropdownSelect
                            value={editData.province}
                            onChange={(value) =>
                              handleInputChange("province", value)
                            }
                            options={provinceOptions}
                            placeholder={
                              provincesLoading
                                ? "Loading..."
                                : "Select province"
                            }
                            className="w-full"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-gray-600">
                            District
                          </label>
                          <DropdownSelect
                            value={editData.district}
                            onChange={(value) =>
                              handleInputChange("district", value)
                            }
                            options={districtOptions}
                            placeholder={
                              !provinceCode
                                ? "Select a province first"
                                : districtsLoading
                                ? "Loading..."
                                : "Select district"
                            }
                            className="w-full"
                            disabled={
                              !provinceCode ||
                              districtsLoading ||
                              districtOptions.length === 0
                            }
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm text-gray-600">
                            Street
                          </label>
                          <input
                            type="text"
                            value={editData.street}
                            onChange={(e) =>
                              handleInputChange("street", e.target.value)
                            }
                            placeholder="123 Beach St"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Event Image */}
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-900">
                        Event Image (Optional)
                      </label>
                      {/* Current Image */}
                      {!previewImage && editEventData?.imageUrl && (
                        <img
                          src={editEventData.imageUrl}
                          alt="Current event"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      )}

                      {/* Preview New Image */}
                      {previewImage && (
                        <div className="relative">
                          <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <button
                            onClick={handleRemoveImage}
                            type="button"
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}

                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          id="editImageUpload"
                          className="hidden"
                        />
                        <label
                          htmlFor="editImageUpload"
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <span className="text-gray-600">
                            {previewImage ? "Change Image" : "Select Image"}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setOpenEditForm(false);
                          setIsInitialLoad(true);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={updateEventMutation.isPending}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {updateEventMutation.isPending
                          ? "Saving..."
                          : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventManager;
