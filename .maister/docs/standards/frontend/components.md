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

### List Tables via `DataTableCard`
Every list/table view in `new_ui` renders through the shared `DataTableCard` (`frontend/new_ui/components/ui/DataTableCard.tsx`). Pages never import `primereact/datatable` or `primereact/column` directly — the component owns the Card wrapper, paginator (10/20/50), striping, stacked responsive layout and the conventions below, so a table fix lands once for every page.
```tsx
const columns: DataTableColumn<ContractDTO>[] = [
    {header: "Najemca", body: tenantBody, sortable: true, field: "person.lastName"},
    {header: "Okres", body: periodBody},
    {header: "Nr faktury", body: (row) => row.invoiceNumber ?? "-", optional: true},
];

const rowActions = (contract: ContractDTO) => (
    <>
        <Button variant="secondary" size="small" icon="pi pi-pencil" onClick={() => edit(contract)}/>
        <Button variant="danger-outline" size="small" icon="pi pi-trash" onClick={() => remove(contract)}/>
    </>
);

<DataTableCard value={contracts} columns={columns} rowActions={rowActions} loading={loading} emptyMessage="Brak danych"/>
```

### Typed Column Definitions
Columns are a typed `DataTableColumn<T>[]` array (`header`, `field?`, `body?`, `sortable?`, `optional?`), not JSX `<Column>` children. `field` is both the plain-value accessor (when no `body`) and the sort key; dot paths like `"person.lastName"` work. Every `sortable: true` column must set `field` — sortable without a field silently does nothing.

### Row Actions Through `rowActions`
Row buttons are passed via the `rowActions` prop as a fragment of `Button`s — no wrapper div, no flex styles, no per-page column widths. `DataTableCard` renders them as the last, right-aligned, content-width column (`ku-col-actions`), and as a separate right-aligned row in the stacked mobile layout.

### Optional (Low-Priority) Columns
Mark secondary columns (descriptions, invoice numbers, audit dates) with `optional: true` rather than letting a wide table scroll horizontally. They are hidden on mid-size table layouts (1025–1439px) and still shown in the stacked card view and on screens ≥1440px; the full record must remain reachable (e.g. a details dialog).

### Card Content Layout via `contentStyle`
To lay out a `Card`'s children (flex, gap, wrapping) use the `contentStyle` prop, not `style`. `style` targets the outer `.p-card` element, whose only child is the PrimeReact body wrapper, so `display: flex`/`gap` on it never reaches the children.
