import { z } from 'zod';
import { insertMessageSchema, insertSubscriberSchema, insertBlogPostSchema, insertBlogCategorySchema, messages, subscribers, projects, blogPosts, blogCategories } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/messages',
      input: insertMessageSchema,
      responses: {
        201: z.custom<typeof messages.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  subscribers: {
    create: {
      method: 'POST' as const,
      path: '/api/subscribers',
      input: insertSubscriberSchema,
      responses: {
        201: z.custom<typeof subscribers.$inferSelect>(),
        400: errorSchemas.validation,
        409: z.object({ message: z.string() }), // Conflict/Duplicate
      },
    },
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects',
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
      },
    },
  },
  blog: {
    list: {
      method: 'GET' as const,
      path: '/api/blog',
      responses: {
        200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
      },
    },
    getBySlug: {
      method: 'GET' as const,
      path: '/api/blog/:slug',
      responses: {
        200: z.custom<typeof blogPosts.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  blogCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/blog/categories',
      responses: {
        200: z.array(z.custom<typeof blogCategories.$inferSelect>()),
      },
    },
  },
  admin: {
    blog: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/blog',
        responses: {
          200: z.array(z.custom<typeof blogPosts.$inferSelect>()),
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/blog',
        input: insertBlogPostSchema,
        responses: {
          201: z.custom<typeof blogPosts.$inferSelect>(),
          400: errorSchemas.validation,
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/blog/:id',
        input: insertBlogPostSchema.partial(),
        responses: {
          200: z.custom<typeof blogPosts.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/blog/:id',
        responses: {
          200: z.object({ success: z.boolean() }),
          404: errorSchemas.notFound,
        },
      },
      setFeatured: {
        method: 'POST' as const,
        path: '/api/admin/blog/:id/featured',
        responses: {
          200: z.custom<typeof blogPosts.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
      updateOrder: {
        method: 'PUT' as const,
        path: '/api/admin/blog/order',
        input: z.array(z.object({ id: z.number(), orderIndex: z.number() })),
        responses: {
          200: z.object({ success: z.boolean() }),
        },
      },
    },
    categories: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/blog/categories',
        responses: {
          200: z.array(z.custom<typeof blogCategories.$inferSelect>()),
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/blog/categories',
        input: insertBlogCategorySchema,
        responses: {
          201: z.custom<typeof blogCategories.$inferSelect>(),
          400: errorSchemas.validation,
        },
      },
      update: {
        method: 'PUT' as const,
        path: '/api/admin/blog/categories/:id',
        input: insertBlogCategorySchema.partial(),
        responses: {
          200: z.custom<typeof blogCategories.$inferSelect>(),
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: 'DELETE' as const,
        path: '/api/admin/blog/categories/:id',
        responses: {
          200: z.object({ success: z.boolean() }),
          404: errorSchemas.notFound,
        },
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
