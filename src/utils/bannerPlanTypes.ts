export const HOME_BANNER_PLAN_TYPE = "Homepage";
export const CATEGORY_BANNER_PLAN_TYPE = "Category";

export const BANNER_PLAN_TYPE_OPTIONS = [
  { value: HOME_BANNER_PLAN_TYPE, label: HOME_BANNER_PLAN_TYPE },
  { value: CATEGORY_BANNER_PLAN_TYPE, label: CATEGORY_BANNER_PLAN_TYPE },
];

export const normalizeBannerPlanType = (value?: string | null): string | null => {
  if (value === undefined || value === null) return null;

  const raw = String(value).trim();
  if (!raw) return null;

  const lowered = raw.toLowerCase();

  if (
    lowered === HOME_BANNER_PLAN_TYPE.toLowerCase() ||
    lowered === "home" ||
    lowered === "home banner" ||
    lowered === "home-banner" ||
    lowered === "home_banner" ||
    lowered === "homebanner"
  ) {
    return HOME_BANNER_PLAN_TYPE;
  }

  if (
    lowered === CATEGORY_BANNER_PLAN_TYPE.toLowerCase() ||
    lowered === "category" ||
    lowered === "category banner" ||
    lowered === "category-banner" ||
    lowered === "category_banner" ||
    lowered === "categorybanner" ||
    lowered === "subcategory" ||
    lowered === "sub-category" ||
    lowered === "sub_category" ||
    lowered === "subcat"
  ) {
    return CATEGORY_BANNER_PLAN_TYPE;
  }

  return raw;
};

export const formatBannerPlanType = (
  value?: string | null,
  {
    fallback = "-",
    suffix = "",
  }: {
    fallback?: string;
    suffix?: string;
  } = {},
): string => {
  const type = normalizeBannerPlanType(value);
  if (!type) return fallback;
  return suffix ? `${type} ${suffix}` : type;
};
