# Confirmation Dialog Utility

This utility provides a unified, beautiful confirmation dialog system using **SweetAlert2** to replace all `window.confirm()` calls throughout the application.

## Features

- ✅ Beautiful, modern UI
- ✅ Consistent design across all confirmation dialogs
- ✅ Customizable colors and text
- ✅ Promise-based API
- ✅ Mobile-friendly
- ✅ Accessible

## Installation

SweetAlert2 is already installed in the project:
```json
"sweetalert2": "^11.26.10"
```

## Usage

### Import

```javascript
import {
  showConfirmDialog,
  confirmDelete,
  confirmApprove,
  confirmCancel,
  confirmCloseRegistration,
  showSuccess,
  showError,
} from "../../utils/confirmDialog";
```

### Basic Confirmation

```javascript
const handleDelete = async () => {
  const confirmed = await confirmDelete("Event Name");
  if (!confirmed) return;
  
  // Proceed with deletion
  await deleteEvent();
};
```

### Approve Confirmation

```javascript
const handleApprove = async () => {
  const confirmed = await confirmApprove("Event Name");
  if (!confirmed) return;
  
  // Proceed with approval
  await approveEvent();
};
```

### Cancel Confirmation

```javascript
const handleCancel = async () => {
  const confirmed = await confirmCancel(
    "Event Name",
    "This will notify all 50 registered volunteers."
  );
  if (!confirmed) return;
  
  // Proceed with cancellation
  await cancelEvent();
};
```

### Close Registration Confirmation

```javascript
const handleCloseRegistration = async () => {
  const confirmed = await confirmCloseRegistration("Event Name");
  if (!confirmed) return;
  
  // Proceed with closing registration
  await closeRegistration();
};
```

### Custom Confirmation

```javascript
const confirmed = await showConfirmDialog({
  title: "Custom Title",
  text: "Custom message text",
  icon: "warning", // 'warning', 'error', 'success', 'info', 'question'
  confirmButtonText: "Yes, do it",
  cancelButtonText: "No, cancel",
  confirmButtonColor: "#3085d6", // Custom color
});
```

### Success Message

```javascript
await showSuccess("Success!", "Event has been approved successfully.");
```

### Error Message

```javascript
await showError("Error!", "Failed to delete event. Please try again.");
```

## API Reference

### `confirmDelete(itemName)`
Shows a delete confirmation dialog with red confirm button.
- **itemName**: Name of the item to delete
- **Returns**: Promise<boolean>

### `confirmApprove(itemName)`
Shows an approve confirmation dialog with green confirm button.
- **itemName**: Name of the item to approve
- **Returns**: Promise<boolean>

### `confirmCancel(itemName, additionalInfo?)`
Shows a cancel confirmation dialog with orange confirm button.
- **itemName**: Name of the item to cancel
- **additionalInfo**: Optional additional information
- **Returns**: Promise<boolean>

### `confirmCloseRegistration(eventName)`
Shows a close registration confirmation dialog.
- **eventName**: Name of the event
- **Returns**: Promise<boolean>

### `showConfirmDialog(options)`
Shows a custom confirmation dialog.
- **options**: Configuration object
  - `title`: Dialog title (default: "Are you sure?")
  - `text`: Dialog message
  - `icon`: Icon type ('warning', 'error', 'success', 'info', 'question')
  - `confirmButtonText`: Text for confirm button
  - `cancelButtonText`: Text for cancel button
  - `confirmButtonColor`: Color for confirm button
- **Returns**: Promise<boolean>

### `showSuccess(title, text)`
Shows a success message.
- **title**: Success title
- **text**: Success message
- **Returns**: Promise<void>

### `showError(title, text)`
Shows an error message.
- **title**: Error title
- **text**: Error message
- **Returns**: Promise<void>

## Migration from window.confirm()

### Before
```javascript
const confirmed = window.confirm("Are you sure you want to delete this?");
if (!confirmed) return;
```

### After
```javascript
const confirmed = await confirmDelete("Item Name");
if (!confirmed) return;
```

## Color Scheme

- **Delete**: Red (#ef4444)
- **Approve**: Green (#22c55e)
- **Cancel**: Orange (#f59e0b)
- **Default**: Blue (#3085d6)
- **Cancel Button**: Red (#d33)

## Examples in Codebase

See these files for implementation examples:
- `Frontend/src/components/Admin/EventManagerCardAd.jsx`
- `Frontend/src/components/Admin/PendingEventCard.jsx`
- `Frontend/src/components/Project/eventManagerCard.jsx`
- `Frontend/src/components/Project/MobileManageCard.jsx`
- `Frontend/src/components/ManageEventDb/VolunteerList.jsx`

