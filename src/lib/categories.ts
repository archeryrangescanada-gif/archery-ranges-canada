export interface CategoryDefinition {
  slug: string
  name: string
  shortName: string
  icon: string
  description: string
  queryType: 'boolean_field' | 'post_tags' | 'combined'
  booleanFields?: string[]
  tagPatterns?: string[]
  textPatterns?: string[]
}

export const CATEGORIES: CategoryDefinition[] = [
  {
    slug: 'youth-programs',
    name: 'Youth Programs',
    shortName: 'Youth Programs',
    icon: 'GraduationCap',
    description: 'Archery ranges offering youth programs, junior leagues, and kids instruction across Canada',
    queryType: 'post_tags',
    tagPatterns: ['youth', 'junior', 'kids', 'children', 'camp'],
    textPatterns: ['youth program', 'junior', 'kids program', 'children', 'young archer'],
  },
  {
    slug: 'lessons-coaching',
    name: 'Lessons & Coaching',
    shortName: 'Lessons',
    icon: 'BookOpen',
    description: 'Archery ranges with professional lessons, coaching, and beginner instruction across Canada',
    queryType: 'boolean_field',
    booleanFields: ['lessons_available'],
  },
  {
    slug: '3d-tournaments',
    name: '3D Ranges & Tournaments',
    shortName: '3D/Tournaments',
    icon: 'Target',
    description: 'Archery ranges with 3D courses, tournament facilities, and competitive shooting across Canada',
    queryType: 'boolean_field',
    booleanFields: ['has_3d_course'],
  },
  {
    slug: 'birthday-parties',
    name: 'Birthday Parties',
    shortName: 'Birthdays',
    icon: 'PartyPopper',
    description: 'Archery ranges offering birthday party packages and group events across Canada',
    queryType: 'post_tags',
    tagPatterns: ['birthday', 'party', 'parties'],
    textPatterns: ['birthday part', 'party package', 'group event'],
  },
  {
    slug: 'pro-shop-rental',
    name: 'Pro Shop & Rental',
    shortName: 'Pro Shop/Rental',
    icon: 'Store',
    description: 'Archery ranges with pro shops and equipment rental services across Canada',
    queryType: 'combined',
    booleanFields: ['has_pro_shop', 'equipment_rental_available'],
  },
  {
    slug: 'womens-programs',
    name: "Women's Programs",
    shortName: "Women's",
    icon: 'Users',
    description: "Archery ranges with women's programs and women-focused instruction across Canada",
    queryType: 'post_tags',
    tagPatterns: ['women', 'ladies'],
    textPatterns: ["women's program", "ladies' night", 'women only'],
  },
]

export function getCategoryBySlug(slug: string): CategoryDefinition | undefined {
  return CATEGORIES.find(c => c.slug === slug)
}
