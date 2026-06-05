import { NewCampgroundForm } from "@/app/components/NewCampgroundForm";

export default function NewCampgroundPage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-bold text-emerald-950">New campground</h1>
      <p className="text-sm text-emerald-800/80">
        Geocoding, embeddings, and full-text index update run on create.
      </p>
      <NewCampgroundForm />
    </div>
  );
}
