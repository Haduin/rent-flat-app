## API

### Feature-colocated React Query Hooks with Toast Feedback
Data-fetching/mutation logic lives in `<feature>.api.ts` files next to the feature, using `@tanstack/react-query`'s `useQuery`/`useMutation`, invalidating a query-key constant on success, and surfacing outcomes via a shared `useToast` hook rather than throwing/catching (only 4 of ~115 sampled files use try/catch).
*Evidence: person.api.ts, contracts.api.ts, expenses-payments-view.api.ts, income-payments-view.api.ts all follow this shape (confidence 80)*
```ts
export const useDeletePerson = () => {
  const {showToast} = useToast();
  return useMutation({
    mutationFn: (personId: number) => client.personApi.deletePerson({id: personId}),
    onSuccess: async () => { showToast('success', ...); await queryClient.invalidateQueries(...) },
    onError: (error) => showToast('error', ..., error.message)
  })
}
```
