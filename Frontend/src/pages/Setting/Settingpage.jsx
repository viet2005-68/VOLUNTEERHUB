import React, { useState, useEffect, useCallback } from "react";
import Card from "../../components/Card.jsx/Card";
import NotificationButton from "../../components/Notification/NotificationButton";
import {
  Edit2,
  Save,
  MapPin,
  Calendar,
  User,
  Mail,
  Phone,
  Home,
  Award,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  Plus,
  X,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useProfile, useUpdateUserProfile } from "../../hook/useUser";
import {
  useProvinces,
  useDistricts,
  findProvinceByName,
  findDistrictByNameOrCode,
} from "../../hook/useVietnamLocations";
import profileSchema from "../../validation/profileSchema";
import { ValidationError } from "yup";
import { LazyLoadImage } from "react-lazy-load-image-component";

const composeAddress = ({ street, districtName, provinceName }) =>
  [street, districtName, provinceName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

const formatAddressDisplay = (address) => {
  if (!address) return "";
  if (typeof address === "string") return address;
  return composeAddress({
    street: address.street,
    districtName: address.district,
    provinceName: address.province,
  });
};

const mapProfileToFormData = (profile) => {
  const safeProfile = (profile && (profile.data ?? profile)) || {};
  const preferences = safeProfile.preferences || {};

  // Handle address as object or string
  const rawAddress = preferences.address || safeProfile.address;
  let provinceName = "";
  let districtName = "";
  let street = "";

  if (rawAddress && typeof rawAddress === "object") {
    // Address is already an object
    provinceName = rawAddress.province || "";
    districtName = rawAddress.district || "";
    street = rawAddress.street || "";
  }

  return {
    name: safeProfile.name || "",
    fullName: safeProfile.fullName || preferences.fullName || "",
    email: safeProfile.email || "",
    phoneNumber: safeProfile.phoneNumber || preferences.phoneNumber || "",
    address: {
      province: provinceName,
      district: districtName,
      street: preferences.street || street,
    },
    skills: Array.isArray(preferences.skills)
      ? preferences.skills
      : Array.isArray(safeProfile.skills)
      ? safeProfile.skills
      : [],
    dateOfBirth: safeProfile.dateOfBirth || preferences.dateOfBirth || "",
    role: safeProfile.role,
    bio: safeProfile.bio || "",
    avatarUrl: safeProfile.avatarUrl,
    totalEvents: safeProfile.totalEvents,
    status: safeProfile.status,
    createdAt: safeProfile.createdAt,
    updatedAt: safeProfile.updatedAt,
    provinceName,
    districtName,
  };
};

export default function Settingpage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile } = useUpdateUserProfile();

  // Callback khi provinces được fetch xong
  const handleProvincesLoaded = useCallback((provincesData) => {
    if (!provincesData?.length) return;

    setFormData((prev) => {
      if (!prev || prev.provinceCode) return prev;
      if (!prev.provinceName) return prev;

      const matchedProvince = findProvinceByName(
        provincesData,
        prev.provinceName
      );
      if (!matchedProvince) return prev;

      return {
        ...prev,
        provinceCode: String(matchedProvince.code),
        provinceName: matchedProvince.name,
        address: {
          ...prev.address,
          province: matchedProvince.name,
        },
      };
    });
  }, []);

  // Callback khi districts được fetch xong
  const handleDistrictsLoaded = useCallback(
    (districtsData, currentProvinceCode) => {
      if (!districtsData?.length) return;

      setFormData((prev) => {
        if (!prev) return prev;
        if (String(prev.provinceCode || "") !== currentProvinceCode)
          return prev;

        const codeCandidate = prev.districtCode
          ? String(prev.districtCode)
          : "";
        let matchedDistrict = codeCandidate
          ? findDistrictByNameOrCode(districtsData, codeCandidate)
          : null;

        const nameCandidate = prev.districtName || "";
        if (!matchedDistrict && nameCandidate) {
          matchedDistrict = findDistrictByNameOrCode(
            districtsData,
            nameCandidate
          );
        }

        const nextDistrictCode = matchedDistrict
          ? String(matchedDistrict.code)
          : "";
        const nextDistrictName = matchedDistrict ? matchedDistrict.name : "";

        if (
          nextDistrictCode === prev.districtCode &&
          nextDistrictName === prev.districtName
        ) {
          return prev;
        }

        return {
          ...prev,
          districtCode: nextDistrictCode,
          districtName: nextDistrictName,
          address: {
            ...prev.address,
            district: nextDistrictName,
          },
        };
      });
    },
    []
  );

  // Sử dụng hooks với onFetched callback và helper functions
  const {
    provinces,
    isLoading: isProvincesLoading,
    isFetching: isProvincesFetching,
    getProvinceByCode,
  } = useProvinces({
    onFetched: handleProvincesLoaded,
  });

  const clearFieldError = (...fields) => {
    if (!fields.length) return;
    setErrors((prev) => {
      let next = prev;
      let changed = false;

      fields.forEach((field) => {
        if (field && next?.[field] !== undefined) {
          if (!changed) {
            next = { ...next };
            changed = true;
          }
          delete next[field];
        }
      });

      return changed ? next : prev;
    });
  };

  const provinceCode = formData?.provinceCode
    ? String(formData.provinceCode)
    : "";
  const districtCode = formData?.districtCode
    ? String(formData.districtCode)
    : "";

  const {
    districts,
    isLoading: isDistrictsLoading,
    isFetching: isDistrictsFetching,
    getDistrictByCode,
  } = useDistricts(provinceCode, {
    onFetched: handleDistrictsLoaded,
  });

  // Reset formData khi profile thay đổi
  useEffect(() => {
    if (profile) {
      const mappedData = mapProfileToFormData(profile);

      setFormData(mappedData);
      setSkillInput("");
      setErrors({});
    }
  }, [profile]);

  useEffect(() => {
    if (
      formData?.provinceName &&
      !formData?.provinceCode &&
      provinces?.length > 0
    ) {
      const matched = provinces.find((p) => p.name === formData.provinceName);
      if (matched) {
        setFormData((prev) => ({
          ...prev,
          provinceCode: String(matched.code),
        }));
      }
    }
  }, [formData?.provinceName, formData?.provinceCode, provinces]);

  useEffect(() => {
    if (
      formData?.districtName &&
      !formData?.districtCode &&
      districts?.length > 0
    ) {
      const matched = districts.find((d) => d.name === formData.districtName);
      if (matched) {
        setFormData((prev) => ({
          ...prev,
          districtCode: String(matched.code),
        }));
      }
    }
  }, [formData?.districtName, formData?.districtCode, districts]);

  if (isLoading || !formData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 text-slate-500 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "street") {
      clearFieldError("address.street", "address");
      setFormData((prev) => {
        if (!prev) return prev;
        if (prev.address?.street === value) {
          return prev;
        }
        return {
          ...prev,
          address: {
            ...prev.address,
            street: value,
          },
        };
      });
      return;
    }

    clearFieldError(name);
    setFormData((prev) => {
      if (!prev) return prev;
      if (prev[name] === value) return prev;
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleProvinceChange = (event) => {
    const selectedCode = event.target.value;
    clearFieldError("address.province", "address.district", "address");

    // Dùng function từ hook để lấy thông tin province
    const matchedProvince = getProvinceByCode(selectedCode);
    const nextProvinceName = matchedProvince?.name || "";

    setFormData((prev) => {
      if (!prev) return prev;
      if (
        prev.provinceCode === selectedCode &&
        prev.provinceName === nextProvinceName &&
        prev.districtCode === "" &&
        prev.districtName === ""
      ) {
        return prev;
      }

      return {
        ...prev,
        provinceCode: selectedCode,
        provinceName: nextProvinceName,
        districtCode: "",
        districtName: "",
        address: {
          ...prev.address,
          province: nextProvinceName,
          district: "",
        },
      };
    });
  };

  const handleDistrictChange = (event) => {
    const selectedCode = event.target.value;
    clearFieldError("address.district", "address");

    // Dùng helper function từ hook để lấy thông tin district
    const matchedDistrict = getDistrictByCode(selectedCode);
    const nextDistrictName = matchedDistrict?.name || "";

    setFormData((prev) => {
      if (!prev) return prev;
      if (
        prev.districtCode === selectedCode &&
        prev.districtName === nextDistrictName
      ) {
        return prev;
      }

      return {
        ...prev,
        districtCode: selectedCode,
        districtName: nextDistrictName,
        address: {
          ...prev.address,
          district: nextDistrictName,
        },
      };
    });
  };

  const handleAddSkill = () => {
    const nextSkill = skillInput.trim();
    if (!nextSkill) {
      setErrors((prev) => ({
        ...prev,
        skills: "Please enter a skill before adding.",
      }));
      return;
    }

    if (
      formData.skills.some(
        (item) => item.toLowerCase() === nextSkill.toLowerCase()
      )
    ) {
      setErrors((prev) => ({
        ...prev,
        skills: "This skill is already listed.",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      skills: [...prev.skills, nextSkill],
    }));
    setSkillInput("");
    setErrors((prev) => {
      if (!prev.skills) return prev;
      const next = { ...prev };
      delete next.skills;
      return next;
    });
  };

  const handleRemoveSkill = (skill) => {
    setFormData((prev) => {
      const nextSkills = prev.skills.filter((item) => item !== skill);

      setErrors((prevErrors) => {
        if (!prevErrors.skills || !nextSkills.length) {
          return prevErrors;
        }
        const next = { ...prevErrors };
        delete next.skills;
        return next;
      });

      return {
        ...prev,
        skills: nextSkills,
      };
    });
  };

  const handleSaveChanges = async () => {
    try {
      const validated = await profileSchema.validate(formData, {
        abortEarly: false,
      });

      setErrors({});
      setIsEditing(false);

      const safeProfile = (profile && (profile.data ?? profile)) || {};
      const existingPreferences = safeProfile.preferences || {};
      const addressPayload = {
        province: formData?.provinceName || validated.address?.province || "",
        district: formData?.districtName || validated.address?.district || "",
        street: validated.address?.street || "",
      };

      const preferencesPayload = {
        ...existingPreferences,
        fullName: validated.fullName,
        phoneNumber: validated.phoneNumber,
        dateOfBirth: validated.dateOfBirth,
        address: addressPayload,
        provinceCode: formData?.provinceCode || "",
        districtCode: formData?.districtCode || "",
        skills: validated.skills || [],
      };
      const payload = {
        name: validated.name,
        fullName: validated.fullName,
        email: validated.email,
        phoneNumber: validated.phoneNumber,
        address: addressPayload,
        dateOfBirth: validated.dateOfBirth,
        bio: validated.bio,
        avatarUrl: validated.avatarUrl,
        skills: validated.skills?.length ? validated.skills : null,
        preferences: preferencesPayload,
      };
      console.log("Updating profile with payload:", payload);
      updateProfile(payload);
    } catch (error) {
      if (error instanceof ValidationError) {
        const nextErrors = error.inner.reduce((acc, curr) => {
          if (curr.path && !acc[curr.path]) {
            acc[curr.path] = curr.message;
          }
          return acc;
        }, {});
        setErrors(nextErrors);
      } else {
        console.error("Failed to validate profile", error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (profile) {
      const resetState = mapProfileToFormData(profile);
      setFormData(resetState);
      setSkillInput("");
      setErrors({});
    }
  };

  const formatDate = (date) =>
    date
      ? new Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }).format(new Date(date))
      : "";

  const completionSteps = [
    {
      id: "avatar",
      label: "Add a profile photo",
      complete: Boolean(formData.avatarUrl),
    },
    { id: "bio", label: "Write a short bio", complete: Boolean(formData.bio) },
    {
      id: "phone",
      label: "Add a phone number",
      complete: Boolean(formData.phoneNumber),
    },
    {
      id: "skills",
      label: "List your skills",
      complete: Boolean(formData.skills.length),
    },
    {
      id: "dob",
      label: "Set your birthdate",
      complete: Boolean(formData.dateOfBirth),
    },
    {
      id: "address",
      label: "Add your address",
      complete: Boolean(
        formData.address?.province ||
          formData.address?.district ||
          formData.address?.street
      ),
    },
  ];

  const completedSteps = completionSteps.filter((item) => item.complete).length;
  const profileCompletion = Math.round(
    (completedSteps / completionSteps.length) * 100
  );

  const actionButton = !isEditing ? (
    <button
      onClick={() => {
        setIsEditing(true);
        setErrors({});
        setSkillInput("");
      }}
      className="inline-flex items-center gap-2 rounded-xl bg-red-400 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-red-400/70"
    >
      <Edit2 className="h-4 w-4" />
      Edit Profile
    </button>
  ) : (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={handleCancelEdit}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        onClick={handleSaveChanges}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-500"
      >
        <Save className="h-4 w-4" />
        Save Changes
      </button>
    </div>
  );

  const getInputClasses = (field) =>
    `rounded-xl border ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-red-200"
        : "border-slate-200 focus:border-blue-400 focus:ring-blue-200"
    } bg-white px-4 py-3 text-sm text-slate-700 shadow-sm transition focus:outline-none disabled:bg-slate-50 disabled:text-slate-400`;

  return (
    <div className="relative min-h-screen bg-slate-100 pb-16 pt-12">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-br from-blue-100 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),transparent_55%)]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white transition  bg-red-400 p-2 rounded-lg hover:bg-red-400/90 active:scale-95 duration-150 ease-in-out"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Settings
                </p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
                  Profile & Preferences
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  Manage how volunteers see you and keep your information up to
                  date across VolunteerHub.
                </p>
              </div>
            </div>
            {actionButton}
          </div>

          <Card
            animate={false}
            className="relative overflow-hidden border border-white/60 bg-white/80 px-6 py-8 shadow-xl shadow-blue-200/60 backdrop-blur"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-purple-50 opacity-70" />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 sm:mx-0">
                  {formData.avatarUrl ? (
                    <LazyLoadImage
                      src={formData.avatarUrl}
                      alt={formData.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
                    <h2 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                      {formData.fullName || formData.name}
                    </h2>
                    <div className="flex gap-2">
                      {formData.role && (
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                          {formData.role}
                        </span>
                      )}
                      {formData.status && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                          {formData.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full rounded-xl border ${
                          errors.bio
                            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                            : "border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                        } bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm focus:outline-none`}
                        placeholder="Share a short introduction about yourself"
                      />
                    ) : formData.bio ? (
                      formData.bio
                    ) : (
                      "Introduce yourself so organizers and volunteers know who you are."
                    )}
                  </p>
                  {isEditing && errors.bio && (
                    <p className="mt-1 text-xs text-red-500">{errors.bio}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 sm:grid-cols-3 sm:gap-6 lg:grid-cols-1">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <MapPin className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Location
                    </p>
                    <p className="font-medium text-slate-700">
                      {formatAddressDisplay(formData.address) ||
                        "No location set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Member Since
                    </p>
                    <p className="font-medium text-slate-700">
                      {formatDate(formData.createdAt) || "--"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <Award className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Events Joined
                    </p>
                    <p className="font-medium text-slate-700">
                      {formData.totalEvents ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card
              animate={false}
              className="border border-slate-200 bg-white px-6 py-6 shadow-lg shadow-slate-200/70"
            >
              <div className="flex flex-col gap-2 pb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Personal Information
                </h2>
                <p className="text-sm text-slate-500">
                  Update your basic details so organizers can reach you when you
                  join or host events.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <User className="h-4 w-4" />
                    Profile Photo URL
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="avatarUrl"
                    value={formData.avatarUrl || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="https://..."
                    className={getInputClasses("avatarUrl")}
                  />
                  {isEditing && errors.avatarUrl && (
                    <p className="text-xs text-red-500">{errors.avatarUrl}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <User className="h-4 w-4" />
                    Username
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={true}
                    className={
                      getInputClasses("name") + " disabled:cursor-not-allowed"
                    }
                    placeholder="Enter your username"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <User className="h-4 w-4" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={getInputClasses("fullName")}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={getInputClasses("email")}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Phone className="h-4 w-4" />
                    Phone<span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={getInputClasses("phoneNumber")}
                  />
                  {isEditing && errors.phoneNumber && (
                    <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Calendar className="h-4 w-4" />
                    Date of Birth<span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={getInputClasses("dateOfBirth")}
                  />
                  {isEditing && errors.dateOfBirth && (
                    <p className="text-xs text-red-500">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div className="flex flex-col gap-3 md:col-span-2">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Home className="h-4 w-4" />
                    Location<span className="ml-1 text-red-500">*</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="province"
                        className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        Province / City
                      </label>
                      <select
                        id="province"
                        name="provinceCode"
                        value={provinceCode || ""}
                        onChange={handleProvinceChange}
                        disabled={
                          !isEditing ||
                          isProvincesLoading ||
                          isProvincesFetching
                        }
                        className={`${getInputClasses(
                          "address.province"
                        )} appearance-none`}
                      >
                        <option value="">
                          {isProvincesLoading || isProvincesFetching
                            ? "Loading provinces..."
                            : "Select province / city"}
                        </option>
                        {provinces.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                      {isEditing && errors["address.province"] && (
                        <p className="text-xs text-red-500">
                          {errors["address.province"]}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="district"
                        className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                      >
                        District
                      </label>
                      <select
                        id="district"
                        name="districtCode"
                        value={districtCode || ""}
                        onChange={handleDistrictChange}
                        disabled={
                          !isEditing ||
                          !provinceCode ||
                          isDistrictsLoading ||
                          isDistrictsFetching
                        }
                        className={`${getInputClasses(
                          "address.district"
                        )} appearance-none`}
                      >
                        <option value="">
                          {isDistrictsLoading || isDistrictsFetching
                            ? "Loading districts..."
                            : "Select district"}
                        </option>
                        {districts.map((district) => (
                          <option key={district.code} value={district.code}>
                            {district.name}
                          </option>
                        ))}
                      </select>
                      {isEditing && errors["address.district"] && (
                        <p className="text-xs text-red-500">
                          {errors["address.district"]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="street"
                      className="text-xs font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Street / Address Line
                    </label>
                    <input
                      id="street"
                      type="text"
                      name="street"
                      value={formData.address?.street || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="House number, street, ward"
                      className={getInputClasses("address.street")}
                    />
                  </div>
                  {isEditing && errors["address.street"] && (
                    <p className="text-xs text-red-500">
                      {errors["address.street"]}
                    </p>
                  )}
                  {isEditing && errors["address.province"] && (
                    <p className="text-xs text-red-500">
                      {errors["address.province"]}
                    </p>
                  )}
                  {isEditing && errors["address.district"] && (
                    <p className="text-xs text-red-500">
                      {errors["address.district"]}
                    </p>
                  )}
                  {isEditing && errors.address && (
                    <p className="text-xs text-red-500">{errors.address}</p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Award className="h-4 w-4" />
                  Skills & Interests<span className="ml-1 text-red-500">*</span>
                </label>
                {isEditing && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        type="text"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder="Advocacy, Event Planning, Fundraising"
                        className={getInputClasses("skills")}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500"
                      >
                        <Plus className="h-4 w-4" />
                        Add Skill
                      </button>
                    </div>
                    {errors.skills && (
                      <p className="text-xs text-red-500">{errors.skills}</p>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {formData.skills.length > 0 ? (
                    formData.skills.map((skill, index) => (
                      <span
                        key={`${skill}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="rounded-full bg-blue-100 p-1 text-blue-600 transition hover:bg-blue-200"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400">
                      No skills added yet
                    </span>
                  )}
                </div>
              </div>
            </Card>

            <div className="flex flex-col gap-6">
              <Card
                animate={false}
                className="border border-slate-200 bg-white px-6 py-6 shadow-lg shadow-blue-100/70"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-slate-900">
                    Profile Health
                  </h4>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {profileCompletion}% complete
                  </span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
                <ul className="mt-5 space-y-3">
                  {completionSteps.map((step) => (
                    <li
                      key={step.id}
                      className="flex items-center gap-3 text-sm text-slate-600"
                    >
                      {step.complete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-300" />
                      )}
                      <span
                        className={
                          step.complete ? "text-slate-700" : "text-slate-500"
                        }
                      >
                        {step.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card
                animate={false}
                className="border border-slate-200 bg-white px-6 py-6 shadow-lg shadow-slate-200/70"
              >
                <h4 className="text-base font-semibold text-slate-900">
                  Contact Summary
                </h4>
                <div className="mt-4 space-y-4 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span>{formData.email || "No email set"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span>{formData.phoneNumber || "No phone number"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Home className="h-4 w-4 text-blue-500" />
                    <span>
                      {formatAddressDisplay(formData.address) ||
                        "No address provided"}
                    </span>
                  </div>
                </div>
                <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                  Last updated {formatDate(formData.updatedAt) || "recently"}
                </div>
              </Card>

              <Card
                animate={false}
                className="border border-slate-200 bg-white px-6 py-6 shadow-lg shadow-slate-200/70"
              >
                <h5 className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Bell className="h-4 w-4 text-blue-500" />
                  Notification Settings
                </h5>
                <p className="mt-2 text-sm text-slate-500">
                  Enable push notifications to receive updates about your
                  upcoming events and activities.
                </p>
                <div className="mt-4">
                  <NotificationButton />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
