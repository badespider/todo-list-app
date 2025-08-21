import { Theme } from "@/components/ui/theme"

export const Component = () => {
  return (
    <div className="flex items-center gap-3">
      <Theme size="md" variant="dropdown" themes={["light", "dark", "system"]} />
    </div>
  )
};
