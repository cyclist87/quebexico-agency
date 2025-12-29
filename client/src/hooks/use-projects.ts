import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useProjects() {
  return useQuery({
    queryKey: [api.projects.list.path],
    queryFn: async () => {
      const res = await fetch(api.projects.list.path);
      if (!res.ok) throw new Error("Failed to fetch projects");
      return api.projects.list.responses[200].parse(await res.json());
    },
    // Fallback data if API returns empty array (for demo purposes)
    placeholderData: [
      {
        id: 1,
        title: "Campagne Hiver",
        description: "Direction artistique pour marque de mode.",
        imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800",
        category: "Design",
        link: "#",
        createdAt: new Date(),
      },
      {
        id: 2,
        title: "Application Mobile",
        description: "UX/UI Design pour startup fintech.",
        imageUrl: "https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&q=80&w=800",
        category: "Web",
        link: "#",
        createdAt: new Date(),
      },
      {
        id: 3,
        title: "Rebranding Corporate",
        description: "Identité visuelle complète.",
        imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&q=80&w=800",
        category: "Branding",
        link: "#",
        createdAt: new Date(),
      },
    ]
  });
}
