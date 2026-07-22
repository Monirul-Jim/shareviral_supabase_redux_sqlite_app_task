import { baseApi } from "./baseApi";
const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: (data) => ({
        url: "/merchant/login",
        method: "POST",
        body: data,
      }),
    }),
    logOutUser: builder.mutation<unknown, void>({
      query: () => ({
        url: "/merchant/logout",
        method: "POST",
      }),
    }),
    getInstituteInfo: builder.query({
      query: () => "/institute-information/index",
      providesTags: ["Institute"],
      keepUnusedDataFor: 300,
    }),
    // updateInstituteInformation: builder.mutation({
    //     query: ({ id, data, isMultipart }) => ({
    //         url: `/institute-information/update/${id}`,
    //         method: "POST",
    //         body: data,
    //         headers: isMultipart
    //             ? { "Content-Type": "multipart/form-data" }
    //             : undefined,
    //     }),
    // }),
    updateInstituteInformation: builder.mutation<
      any,
      { id: number; data: FormData }
    >({
      query: ({ id, data }) => ({
        url: `/institute-information/update/${id}`,
        method: "POST",
        body: data, // ✅ no headers
      }),
      invalidatesTags: ["Institute"], // 🔥 THIS IS REQUIRED
    }),
  }),
});

export const {
  useLoginUserMutation,
  useLogOutUserMutation,
  useGetInstituteInfoQuery,
  useUpdateInstituteInformationMutation,
} = authApi;
