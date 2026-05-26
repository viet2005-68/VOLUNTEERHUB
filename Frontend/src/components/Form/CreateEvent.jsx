import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import FormLayout from "../../Layout/FormLayout";
import DropdownSelect from "../Dropdown/DropdownSelect";
import { getCoordinates } from "../../utils/getCoordinates";
import MapPreview from "../Location/MapPreview";
import { useCreateEvent } from "../../hook/useEvent";
import { useProvinces, useDistricts } from "../../hook/useVietnamLocations";
import { Trash2, X } from "lucide-react";

const categoryOptions = [
  { value: "health", label: "Health" },
  { value: "education", label: "Education" },
  { value: "environment", label: "Environment" },
  { value: "animals", label: "Animals" },
  { value: "other", label: "Other" },
];

const eventSchema = yup.object({
  name: yup.string().trim().required("Event title is required."),
  description: yup.string().trim().required("Description is required."),
  imageFile: yup
    .mixed()
    .nullable()
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value || value.length === 0) return true;
      const file = value[0];
      return file && file.type.startsWith("image/");
    })
    .notRequired(),
  categoryName: yup.string().required("Please select a category."),
  startTime: yup.string().required("Start time is required."),
  endTime: yup
    .string()
    .required("End time is required.")
    .test(
      "is-after-start",
      "End time must be after start time.",
      function (value) {
        const { startTime } = this.parent;
        if (!startTime || !value) return true;
        return new Date(value) > new Date(startTime);
      }
    ),
  capacity: yup
    .number()
    .typeError("Capacity must be a number.")
    .integer("Capacity must be an integer.")
    .min(1, "Capacity must be at least 1.")
    .required("Capacity is required."),
  registrationDeadline: yup
    .string()
    .required("Registration deadline is required."),
  minAge: yup
    .number()
    .typeError("Minimum age must be a number.")
    .min(0, "Minimum age cannot be negative.")
    .nullable()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .notRequired(),
  street: yup.string().trim().required("Street is required."),
  district: yup.string().trim().required("District is required."),
  province: yup.string().trim().required("Province is required."),
});

function CreateEvent({ onSuccess, onCancel }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
      name: "",
      description: "",
      imageFile: null,
      categoryName: "",
      startTime: "",
      endTime: "",
      capacity: "",
      registrationDeadline: "",
      minAge: "",
      street: "",
      district: "",
      province: "",
    },
  });

  const [coordinates, setCoordinates] = useState({ lat: null, lon: null });
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  const createEventMutation = useCreateEvent({
    onSuccess: (data, variables, context) => {
      reset();
      setCoordinates({ lat: null, lon: null });
      setPreviewImage(null);
      onSuccess?.(data, variables, context);
    },
  });

  const onSubmit = (values) => {
    const formData = new FormData();

    // Create eventRequest object
    const eventRequest = {
      name: values.name,
      description: values.description,
      categoryName: values.categoryName,
      startTime: values.startTime,
      endTime: values.endTime,
      capacity: values.capacity,
      registrationDeadline: values.registrationDeadline,
      minAge: values.minAge || undefined,
      address: {
        street: values.street,
        district: values.district,
        province: values.province,
      },
    };

    // Add eventRequest as JSON blob with application/json content type
    formData.append(
      "eventRequest",
      new Blob([JSON.stringify(eventRequest)], { type: "application/json" })
    );

    // Add imageFile if exists
    if (values.imageFile && values.imageFile[0]) {
      formData.append("imageFile", values.imageFile[0]);
    }

    createEventMutation.mutate(formData);
  };

  const street = watch("street");
  const district = watch("district");
  const province = watch("province");
  const imageFile = watch("imageFile");

  // use vietnam hook to fetch infommation about province and district
  const {
    provinces,
    getProvinceByName,
    isLoading: provincesLoading,
  } = useProvinces();
  const selectedProvince = useMemo(
    () => getProvinceByName(province),
    [getProvinceByName, province]
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

  const addressString = useMemo(
    () => [street, district, province].filter(Boolean).join(", ") || "",
    [street, district, province]
  );

  // Reset district when province changes
  useEffect(() => {
    setValue("district", "");
  }, [province, setValue]);

  useEffect(() => {
    if (!addressString) {
      setCoordinates((prev) => {
        if (prev.lat === null && prev.lon === null) {
          return prev;
        }
        return { lat: null, lon: null };
      });
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const coords = await getCoordinates(addressString);
        setCoordinates((prev) => {
          const nextLat = coords ? Number(coords.lat) : null;
          const nextLon = coords ? Number(coords.lon) : null;
          if (prev.lat === nextLat && prev.lon === nextLon) {
            return prev;
          }
          return { lat: nextLat, lon: nextLon };
        });
      } catch (error) {
        console.error("Error fetching coordinates:", error);
        setCoordinates((prev) => {
          if (prev.lat === null && prev.lon === null) {
            return prev;
          }
          return { lat: null, lon: null };
        });
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [addressString]);

  // Handle image preview
  useEffect(() => {
    if (imageFile && imageFile[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(imageFile[0]);
    } else {
      setPreviewImage(null);
    }
  }, [imageFile]);

  const handleRemoveImage = () => {
    setPreviewImage(null);
    reset({ ...watch(), imageFile: null });
  };

  return (
    <FormLayout
      title="Create New Event"
      description="Fill in the event information. All fields marked with * are required."
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
            Event Title *
          </label>
          <input
            type="text"
            id="name"
            {...register("name")}
            placeholder="Beach Cleanup Drive"
            className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
            required
          />
          {errors.name && (
            <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.name.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="category" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
            Category *
          </label>
          <Controller
            name="categoryName"
            control={control}
            render={({ field }) => (
              <DropdownSelect
                value={field.value}
                onChange={field.onChange}
                options={categoryOptions}
                placeholder="Select category"
                className="w-full"
              />
            )}
          />
          {errors.categoryName && (
            <p className="text-sm font-medium leading-[1.2] text-foudre-pink">
              {errors.categoryName.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="description" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
          Description *
        </label>
        <textarea
          id="description"
          rows={4}
          {...register("description")}
          placeholder="Describe your volunteer opportunity..."
          className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
          required
        />
        {errors.description && (
          <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.description.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="imageFile" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
          Event Image (Optional)
        </label>
        {previewImage ? (
          <div className="flex items-center gap-3">
            <div
              className="group relative h-32 w-32 flex-shrink-0 cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={previewImage}
                alt="Preview"
                className="h-full w-full rounded-2xl border-2 border-foudre-pink object-cover transition group-hover:border-deep-forest"
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-deep-forest/0 transition group-hover:bg-deep-forest/30">
                <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                  Click to view
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium leading-[0.85] text-deep-forest/70">Image selected</p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-2 rounded-lg bg-foudre-pink px-4 py-2 text-sm font-bold text-pale-canvas transition hover:bg-deep-forest"
              >
                <Trash2 /> Remove
              </button>
            </div>
          </div>
        ) : (
          <input
            type="file"
            id="imageFile"
            accept="image/*"
            {...register("imageFile")}
            className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
          />
        )}
        {errors.imageFile && (
          <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.imageFile.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="startTime" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
            Start Time *
          </label>
          <input
            type="datetime-local"
            id="startTime"
            {...register("startTime")}
            className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
            required
          />
          {errors.startTime && (
            <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.startTime.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="endTime" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
            End Time *
          </label>
          <input
            type="datetime-local"
            id="endTime"
            {...register("endTime")}
            className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
            required
          />
          {errors.endTime && (
            <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.endTime.message}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="capacity" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
            Max Volunteers *
          </label>
          <input
            type="number"
            id="capacity"
            {...register("capacity", { valueAsNumber: true })}
            min="1"
            className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
            required
          />
          {errors.capacity && (
            <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.capacity.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="registrationDeadline" className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">
            Registration Deadline *
          </label>
          <input
            type="datetime-local"
            id="registrationDeadline"
            {...register("registrationDeadline")}
            className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
            required
          />
          {errors.registrationDeadline && (
            <p className="text-sm font-medium leading-[1.2] text-foudre-pink">
              {errors.registrationDeadline.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold uppercase leading-[0.85] text-deep-forest">Location *</label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 z-50">
          <div className="flex flex-col gap-2">
            <label htmlFor="province" className="text-sm font-medium leading-[0.85] text-deep-forest/70">
              Province
            </label>
            <Controller
              name="province"
              control={control}
              render={({ field }) => (
                <DropdownSelect
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                  options={provinceOptions}
                  placeholder={
                    provincesLoading ? "Loading..." : "Select province"
                  }
                  className="w-full"
                />
              )}
            />
            <input
              type="text"
              id="province"
              {...register("province")}
              placeholder="Da Nang"
              className="hidden w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
              disabled
            />
            {errors.province && (
              <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.province.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="district" className="text-sm font-medium leading-[0.85] text-deep-forest/70">
              District
            </label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <DropdownSelect
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
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
              )}
            />
            <input
              type="text"
              id="district"
              {...register("district")}
              placeholder="Da Nang"
              className="hidden w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
              disabled
            />
            {errors.district && (
              <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.district.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="street" className="text-sm font-medium leading-[0.85] text-deep-forest/70">
              Street
            </label>
            <input
              type="text"
              id="street"
              {...register("street")}
              placeholder="123 Beach St"
              className="w-full rounded-lg border border-deep-forest/20 bg-pale-canvas px-4 py-3 text-deep-forest placeholder:text-deep-forest/45 transition focus:border-foudre-pink focus:outline-none focus:ring-2 focus:ring-foudre-pink/25"
              required
            />
            {errors.street && (
              <p className="text-sm font-medium leading-[1.2] text-foudre-pink">{errors.street.message}</p>
            )}
          </div>
        </div>
        <div className="mt-4 z-20">
          <MapPreview
            lat={coordinates.lat}
            lon={coordinates.lon}
            address={addressString}
          />
        </div>
      </div>

      <div className="flex gap-3 border-t border-deep-forest/15 pt-4">
        <button
          type="button"
          onClick={() => {
            reset();
            setCoordinates({ lat: null, lon: null });
            setPreviewImage(null);
            onCancel?.();
          }}
          className="flex-1 rounded-lg border border-deep-forest bg-transparent px-5 py-3 text-base font-bold uppercase text-deep-forest transition hover:border-foudre-pink hover:bg-ash-whisper hover:text-foudre-pink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createEventMutation.isPending}
          className="flex-1 rounded-lg bg-bubblegum-blush px-5 py-3 text-base font-bold uppercase text-pale-canvas transition hover:bg-foudre-pink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createEventMutation.isPending ? "Creating..." : "Create Event"}
        </button>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && previewImage && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-deep-forest/85 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 rounded-full bg-pale-canvas p-2 text-deep-forest transition hover:bg-foudre-pink hover:text-pale-canvas"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewImage}
              alt="Preview full size"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </FormLayout>
  );
}

export default CreateEvent;
