## Components

### Single Responsibility
Each component should do one thing well.

### Reusability
Design components to work across different contexts with configurable props.

### Composability
Build complex UIs by combining smaller components rather than creating monoliths.

### Clear Interface
Define explicit, documented props with sensible defaults.

### Encapsulation
Keep implementation details private; expose only what's necessary.

### Consistent Naming
Use descriptive names that indicate purpose and follow team conventions.

### Local State
Keep state as close to where it's used as possible; lift only when needed.

### Minimal Props
If a component needs many props, consider composition or splitting it.

### Documentation
Document usage, props, and examples to help team adoption.

### Functional Components with Formik + Yup for Forms
Modal/dialog form components are functional components (no classes found) built with `useFormik` and a co-located Yup validation schema file (`*.validation-schema.ts`), composed from shared primitives (Modal, SelectField, DateSelector, TextField, ModalFooter).
*Evidence: add-contract-view.tsx, update-contract-modal.tsx, add-edit-expenses-template-dialog.tsx, income-confirm-payment-dialog.tsx all follow this (confidence 70)*
