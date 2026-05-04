import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import EventManagerCard from "../../components/Project/eventManagerCard";
import { EVENT_STATUS } from "../../../constant/eventStatus";
import DropdownSelect from "../../components/Dropdown/DropdownSelect";
import CreateEvent from "../../components/Form/CreateEvent";
import useClickOutside from "../../hook/ClickOutside";
import { useEventPaginationAdmin } from "../../../hook/useEvent";

function EventManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [openCreateForm, setOpenCreateForm] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useEventPaginationAdmin({
    pageNum: 0,
    pageSize: 100,
    status: filterStatus === "all" ? undefined : filterStatus,
  });

  const events = data?.data || [];

  useEffect(() => {
    if (openCreateForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [openCreateForm]);

  const handleCreateNew = () => {
    setOpenCreateForm(true);
  };
  const modalRef = useClickOutside(() => {
    setOpenCreateForm(false);
  });
  const filteredEvents = events?.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

    console.log(`Event cancelled successfully`);
  };

  const handleEdit = (id) => {
    console.log(`Edit event ${id}`);
    // TODO: Navigate to edit page or open modal
  };

  const handleView = (id) => {
    console.log(`View event ${id}`);
    // TODO: Navigate to event detail page
  };

  const handleDelete = (id) => {
    console.log(`Delete event ${id}`);
    // TODO: Show confirmation modal and delete
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading events...</div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">
            Error loading events: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm gap-6 flex flex-col ">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-gray-900">Your Events</h2>
        <p className="text-gray-500">Manage all your volunteer opportunities</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter & Create */}
        <div className="flex gap-3 items-center">
          <DropdownSelect
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: "all", label: "All Status" },
              { value: EVENT_STATUS.PENDING, label: "Pending" },
              { value: EVENT_STATUS.APPROVED, label: "Approved" },
              { value: EVENT_STATUS.REJECTED, label: "Rejected" },
            ]}
            className="w-[160px]"
          />

          <button
            onClick={() => setOpenCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Event
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Location
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Volunteers
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents && filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <EventManagerCard
                  key={event.id}
                  data={event}
                  onCancelEvent={handleCancelEvent}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">No events found</p>
                    <button
                      onClick={handleCreateNew}
                      className="text-blue-600 hover:underline"
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

      {/* Stats Footer */}
      {filteredEvents && filteredEvents.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {filteredEvents.length} of {events.length} events
          </p>
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">
              Total Volunteers:{" "}
              <span className="font-semibold">
                {events.reduce((sum, e) => sum + e.registered, 0)}
              </span>
            </span>
          </div>
        </div>
      )}
      {openCreateForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div ref={modalRef} className="w-full max-w-3xl my-8">
            <div className="relative bg-white rounded-2xl shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
              <button
                onClick={() => setOpenCreateForm(false)}
                className="absolute top-4 right-4 z-10 rounded-full bg-gray-100 p-2 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition"
                aria-label="Close"
              >
                <span className="text-xl font-bold leading-none">×</span>
              </button>
              <CreateEvent
                onSuccess={() => setOpenCreateForm(false)}
                onCancel={() => setOpenCreateForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EventManager;
