import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  useProfileCompleteness,
  useUpdateUserProfile,
  useProfile,
} from "../../hook/useUser";
import {
  useProvinces,
  useDistricts,
  findProvinceByName,
  findDistrictByNameOrCode,
} from "../../hook/useVietnamLocations";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Loader2,
  Home,
} from "lucide-react";
import toast from "react-hot-toast";

function CompleteProfile() {
  const navigate = useNavigate();
  const { data: profileData, isLoading: isLoadingProfile } = useProfile();
  const { data: validation, isLoading: isValidating } =
    useProfileCompleteness();
  const updateProfileMutation = useUpdateUserProfile();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    address: {
      province: "",
      district: "",
      street: "",
    },
    bio: "",
    provinceCode: "",
    districtCode: "",
    provinceName: "",
    districtName: "",
  });

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

  // Sử dụng hooks với onFetched callback
  const {
    provinces,
    isLoading: isProvincesLoading,
    isFetching: isProvincesFetching,
    getProvinceByCode,
  } = useProvinces({
    onFetched: handleProvincesLoaded,
  });

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

  useEffect(() => {
    if (profileData) {
      const preferences = profileData.preferences || {};
      const rawAddress = preferences.address || profileData.address;

      let provinceName = "";
      let districtName = "";
      let street = "";

      if (rawAddress && typeof rawAddress === "object") {
        provinceName = rawAddress.province || "";
        districtName = rawAddress.district || "";
        street = rawAddress.street || "";
      } else if (typeof rawAddress === "string") {
        street = rawAddress;
      }

      setFormData({
        fullName: profileData.fullName || preferences.fullName || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || preferences.phoneNumber || "",
        dateOfBirth: profileData.dateOfBirth || preferences.dateOfBirth || "",
        address: {
          province: provinceName,
          district: districtName,
          street: street,
        },
        bio: profileData.bio || "",
        provinceCode: "",
        districtCode: "",
        provinceName: provinceName,
        districtName: districtName,
      });
    }
  }, [profileData]);

  useEffect(() => {
    // If profile is already complete, redirect to dashboard
    if (validation?.isComplete && !isValidating) {
      navigate("/dashboard");
    }
  }, [validation, isValidating, navigate]);

  // Sync provinceCode when provinceName exists and provinces are loaded
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

  // Sync districtCode when districtName exists and districts are loaded
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "street") {
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          street: value,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProvinceChange = (event) => {
    const selectedCode = event.target.value;
    const matchedProvince = getProvinceByCode(selectedCode);
    const nextProvinceName = matchedProvince?.name || "";

    setFormData((prev) => ({
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
    }));
  };

  const handleDistrictChange = (event) => {
    const selectedCode = event.target.value;
    const matchedDistrict = getDistrictByCode(selectedCode);
    const nextDistrictName = matchedDistrict?.name || "";

    setFormData((prev) => ({
      ...prev,
      districtCode: selectedCode,
      districtName: nextDistrictName,
      address: {
        ...prev.address,
        district: nextDistrictName,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = validation?.missingFields || [];
    const hasAllRequired = missingFields.every((field) => {
      if (field === "address") {
        return (
          formData.address?.province ||
          formData.address?.district ||
          formData.address?.street
        );
      }
      return formData[field] && formData[field].trim() !== "";
    });

    if (!hasAllRequired && missingFields.length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Prepare payload with address object
    const addressPayload = {
      province: formData.provinceName || formData.address?.province || "",
      district: formData.districtName || formData.address?.district || "",
      street: formData.address?.street || "",
    };

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      dateOfBirth: formData.dateOfBirth,
      address: addressPayload,
      bio: formData.bio,
      preferences: {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        address: addressPayload,
        provinceCode: formData.provinceCode || "",
        districtCode: formData.districtCode || "",
      },
    };

    updateProfileMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Profile completed successfully!");
        // Clear skip/dismiss flags
        localStorage.removeItem("profileSkipped");
        localStorage.removeItem("profileBannerDismissed");

        // Check if there's a redirect URL from event registration
        const redirectUrl = sessionStorage.getItem("redirectAfterProfile");
        if (redirectUrl) {
          sessionStorage.removeItem("redirectAfterProfile");
          navigate(redirectUrl);
        } else {
          navigate("/dashboard");
        }
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update profile");
      },
    });
  };

  const handleSkip = () => {
    // Store skip flag in localStorage
    localStorage.setItem("profileSkipped", "true");
    navigate("/dashboard");
  };

  if (isLoadingProfile || isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f6] font-['Clash_Grotesk',Inter,ui-sans-serif,system-ui]">
        <div className="flex items-center gap-3 text-[#00522d]">
          <Loader2 className="h-8 w-8 animate-spin text-[#db3c8a]" />
          <span className="text-sm font-medium leading-[1.2]">Loading profile...</span>
        </div>
      </div>
    );
  }

  const missingFields = validation?.missingFields || [];
  const isFieldRequired = (fieldName) => missingFields.includes(fieldName);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] px-4 py-10 font-['Clash_Grotesk',Inter,ui-sans-serif,system-ui] text-[#00522d]">
      <div className="w-full max-w-3xl rounded-[25px] border-2 border-[#db3c8a] bg-[#fff8f6] p-6 md:p-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#f29ebd] text-[#00522d]">
            <User className="h-8 w-8" />
          </div>
          <h1 className="mx-auto mb-3 max-w-2xl font-['Beni','Bebas_Neue',Impact,ui-sans-serif] text-[64px] font-black uppercase leading-[0.7] text-[#db3c8a] md:text-[94px]">
            Complete Your Profile
          </h1>
          <p className="text-base font-medium leading-[1.2] text-[#00522d]">
            Help us personalize your experience by completing your profile
          </p>
          {missingFields.length > 0 && (
            <div className="mt-5 rounded-[10px] bg-[#fce5df] px-5 py-3">
              <p className="text-sm font-medium leading-[1.2] text-[#db3c8a]">
                <span className="font-bold">Required fields:</span>{" "}
                {missingFields.join(", ")}
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold leading-[1.2] text-[#00522d]">
                Full Name{" "}
                {isFieldRequired("fullName") && (
                  <span className="text-[#db3c8a]">*</span>
                )}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#db3c8a]" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-[10px] border-2 border-[#fce5df] bg-white px-4 py-4 pl-11 text-sm font-medium leading-[1.2] text-[#00522d] placeholder:text-[#00522d]/55 focus:border-[#db3c8a] focus:outline-none"
                  placeholder="Enter your full name"
                  required={isFieldRequired("fullName")}
                />
              </div>
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold leading-[1.2] text-[#00522d]">
                Email{" "}
                {isFieldRequired("email") && (
                  <span className="text-[#db3c8a]">*</span>
                )}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#db3c8a]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-[10px] border-2 border-[#fce5df] bg-[#fce5df]/55 px-4 py-4 pl-11 text-sm font-medium leading-[1.2] text-[#00522d] placeholder:text-[#00522d]/55 focus:border-[#db3c8a] focus:outline-none disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  disabled
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-bold leading-[1.2] text-[#00522d]">
                Phone Number{" "}
                {isFieldRequired("phoneNumber") && (
                  <span className="text-[#db3c8a]">*</span>
                )}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#db3c8a]" />
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full rounded-[10px] border-2 border-[#fce5df] bg-white px-4 py-4 pl-11 text-sm font-medium leading-[1.2] text-[#00522d] placeholder:text-[#00522d]/55 focus:border-[#db3c8a] focus:outline-none"
                  placeholder="Enter your phone number"
                  required={isFieldRequired("phoneNumber")}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="mb-2 block text-sm font-bold leading-[1.2] text-[#00522d]">
                Date of Birth{" "}
                {isFieldRequired("dateOfBirth") && (
                  <span className="text-[#db3c8a]">*</span>
                )}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#db3c8a]" />
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full rounded-[10px] border-2 border-[#fce5df] bg-white px-4 py-4 pl-11 text-sm font-medium leading-[1.2] text-[#00522d] placeholder:text-[#00522d]/55 focus:border-[#db3c8a] focus:outline-none"
                  required={isFieldRequired("dateOfBirth")}
                />
              </div>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="mb-2 flex items-center gap-2 text-sm font-bold leading-[1.2] text-[#00522d]">
                <Home className="w-4 h-4" />
                Location{" "}
                {isFieldRequired("address") && (
                  <span className="text-[#db3c8a]">*</span>
                )}
              </label>

              {/* Province/City */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium leading-[1.2] text-[#00522d]/75">
                  Province / City
                </label>
                <select
                  name="provinceCode"
                  value={provinceCode || ""}
                  onChange={handleProvinceChange}
                  disabled={isProvincesLoading || isProvincesFetching}
                  className="w-full rounded-[10px] border-2 border-[#fce5df] bg-white px-4 py-4 text-sm font-bold leading-[1.2] text-[#00522d] focus:border-[#db3c8a] focus:outline-none"
                  required={isFieldRequired("address")}
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
              </div>

              {/* District */}
              <div className="mb-3">
                <label className="mb-1 block text-xs font-medium leading-[1.2] text-[#00522d]/75">
                  District
                </label>
                <select
                  name="districtCode"
                  value={districtCode || ""}
                  onChange={handleDistrictChange}
                  disabled={
                    !provinceCode || isDistrictsLoading || isDistrictsFetching
                  }
                  className="w-full rounded-[10px] border-2 border-[#fce5df] bg-white px-4 py-4 text-sm font-bold leading-[1.2] text-[#00522d] focus:border-[#db3c8a] focus:outline-none disabled:cursor-not-allowed disabled:bg-[#fce5df]/55"
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
              </div>

              {/* Street */}
              <div>
                <label className="mb-1 block text-xs font-medium leading-[1.2] text-[#00522d]/75">
                  Street / Address Line
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#db3c8a]" />
                  <input
                    type="text"
                    name="street"
                    value={formData.address?.street || ""}
                    onChange={handleChange}
                    className="w-full rounded-[10px] border-2 border-[#fce5df] bg-white px-4 py-4 pl-11 text-sm font-medium leading-[1.2] text-[#00522d] placeholder:text-[#00522d]/55 focus:border-[#db3c8a] focus:outline-none"
                    placeholder="House number, street, ward"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold leading-[1.2] text-[#00522d]">
                Bio{" "}
                {isFieldRequired("bio") && (
                  <span className="text-[#db3c8a]">*</span>
                )}
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-5 h-5 text-[#db3c8a]" />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-[10px] border-2 border-[#fce5df] bg-white px-4 py-4 pl-11 text-sm font-medium leading-[1.2] text-[#00522d] placeholder:text-[#00522d]/55 focus:border-[#db3c8a] focus:outline-none"
                  placeholder="Tell us about yourself..."
                  required={isFieldRequired("bio")}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#f29ebd] px-6 py-5 text-base font-bold leading-[0.85] text-[#fff8f6] transition-colors hover:bg-[#db3c8a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Complete Profile"
              )}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 rounded-[10px] border-2 border-[#00522d] bg-transparent px-6 py-5 text-base font-bold leading-[0.85] text-[#00522d] transition-colors hover:bg-[#00522d] hover:text-[#fff8f6]"
            >
              Skip for Now
            </button>
          </div>
        </form>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-sm font-medium leading-[1.2] text-[#00522d]/70">
            You can update your profile anytime from the settings page
          </p>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;
