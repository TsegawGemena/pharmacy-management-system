import { apiFetch, unwrapList } from "@/lib/api/client";

export interface Category {
  id: string;
  name: string;
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await apiFetch<unknown>("/categories");
    return unwrapList<Category>(response);
  } catch {
    return [];
  }
}

export async function createCategory(name: string): Promise<Category> {
  const response = await apiFetch<unknown>("/categories", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (response && typeof response === "object" && "data" in response) {
    return (response as { data: Category }).data;
  }
  return response as Category;
}

export async function deleteCategory(id: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/categories/${id}`, {
    method: "DELETE",
  });
}
