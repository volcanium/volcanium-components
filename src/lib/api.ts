const api = {
  get: async (url: string, config?: { params?: Record<string, any> }) => ({
    data: { data: [] as any[], total: 0, ok: true, msg: "" },
  }),
  post: async (url: string, data: any) => ({ data: { data, ok: true, msg: 'Created' } }),
  patch: async (url: string, data: any) => ({ data: { data, ok: true, msg: 'Updated' } }),
  delete: async (url: string, data?: any) => ({ data: { ok: true, msg: 'Deleted' } }),
};

export default api;
