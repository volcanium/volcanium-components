const api = {
  get: async (url: string) => ({ data: { data: [], ok: true, msg: '' } }),
  post: async (url: string, data: any) => ({ data: { data, ok: true, msg: 'Created' } }),
  patch: async (url: string, data: any) => ({ data: { data, ok: true, msg: 'Updated' } }),
  delete: async (url: string, data?: any) => ({ data: { ok: true, msg: 'Deleted' } }),
};

export default api;
