import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { logout, setUser } from "../feature/authSlice";

/* ---------------- RAW BASE QUERY ---------------- */

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.EXPO_PUBLIC_API_URL,
  credentials: "include", // Enables automatic cookie handling
  prepareHeaders: (headers) => {
    if (!headers.get("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return headers;
  },
});

/* ---------------- BASE QUERY WITH REFRESH ---------------- */

const baseQueryWithRefresh: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    // 🔁 REFRESH TOKEN (Rely on merchant_refresh_token cookie)
    const refreshResult = await rawBaseQuery(
      { url: "/merchant/refresh", method: "POST" },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const resData: any = refreshResult.data;
      const apiPayload = resData.payload?.data;

      if (apiPayload?.user) {
        if (__DEV__) console.log("[Auth] Token refreshed successfully.");
        api.dispatch(
          setUser({
            user: {
              name: apiPayload.user.name,
              email: apiPayload.user.email,
              mobile: apiPayload.user.mobile,
              status: apiPayload.user.status,
              institute: apiPayload.user.institute_details,
            },
          }),
        );
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        if (__DEV__) console.warn("[Auth] Refresh failed: No user in payload.");
        api.dispatch(baseApi.util.resetApiState());
        api.dispatch(logout());
      }
    } else {
      if (__DEV__)
        console.warn("[Auth] Refresh failed: Session expired or invalid.");
      api.dispatch(baseApi.util.resetApiState());
      api.dispatch(logout());
    }
  }

  return result;
};

/* ---------------- CREATE BASE API ---------------- */

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: baseQueryWithRefresh,
  tagTypes: [
    "AuthUser",
    "InstitutePackage",
    "Users",
    "Institute",
    "CoreInstitute",
    "Subcategories",
    "Mapping",
    "Enrollment",
    "Departments",
    "Students",
    "AcademicYears",
    "ClassShiftSections",
    "Subjects",
    "SubjectConfig",
    "AdmissionSubjects",
    "FeeAmount",
    "FundAccount",
    "AttendanceConfiguration",
    "Student",
    "Attendance",
    "PeriodConfig",
    "Subject",
    "AttendanceUpdate",
    "SmsRate",
    "SmsTemplate",
    "PhoneBook",
    "SemesterExam",
    "SemesterExamAssign",
    "AttendanceIds",
    "HRList",
    "HRLedgerMerge",
    "instituteWiseIdCardList",
    "ExamMarkEntry",
    "ClassTest",
    "ClassTestAssign",
    "InstituteExamCode",
    "InstituteExamGrade",
    "ClassTestMapping",
    "ExamConfiguration",
    "totalStudents",
    "ClassRoutine",
    "ExamRoutine",
    "TransferCertificateList",
    "VoucherPayment",
    "VoucherReceipt",
    "VoucherContra",
    "VoucherJournal",
    "FundTransfer",
    "VoucherAll",
    "SmsReport",
    "UserListMeta",
    "UserListWithRules",
    "Roles",
    "Permissions",
    "GeneralConfig",
  ],
  endpoints: () => ({}),
});
