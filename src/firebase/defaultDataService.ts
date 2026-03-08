import { rawData } from './data';

export interface DefaultMaterial {
  id: string;
  subject_name: string;
  category: 'Notes' | 'PYQ' | 'Assignment' | 'Video' | 'Other';
  year: string;
  material_url: string;
  description: string;
  tags: string[];
  uploader_username: string;
  uploader_profile_picture?: string;
  created_at: string;
  status: 'approved';
  isDefault: boolean;
  semester: string;
  credits?: number;
  subjectcode?: string;
}

/**
 * Convert raw data structure to material cards
 * Extracts all subjects and their resources from data.ts
 */
export const getDefaultMaterialsFromData = (): DefaultMaterial[] => {
  const materials: DefaultMaterial[] = [];
  const baseData = rawData.home;

  // Iterate through semesters (first, second, etc.)
  Object.entries(baseData).forEach(([semesterKey, semesterData]: [string, any]) => {
    const semesterName = semesterKey.charAt(0).toUpperCase() + semesterKey.slice(1); // "first" -> "First"

    // Iterate through subjects (Physics, Chemistry, etc.)
    Object.entries(semesterData).forEach(([subjectName, subjectData]: [string, any]) => {
      const credits = subjectData.credits || 0;
      const subjectcode = subjectData.subjectcode || '';

      // Iterate through resource types (Notes, PYQ's, Youtube Video, Assignments, etc.)
      Object.entries(subjectData).forEach(([resourceType, resourceContent]: [string, any]) => {
        // Skip metadata fields
        if (resourceType === 'credits' || resourceType === 'subjectcode') return;

        let categoryMapping: DefaultMaterial['category'] = 'Other';
        if (resourceType.includes('Note')) categoryMapping = 'Notes';
        else if (resourceType.includes('PYQ')) categoryMapping = 'PYQ';
        else if (resourceType.includes('Assignment')) categoryMapping = 'Assignment';
        else if (resourceType.includes('Youtube') || resourceType.includes('Video'))
          categoryMapping = 'Video';

        // Handle nested structure (e.g., { "Atul sir Notes": { "UNIT 1": url } })
        if (typeof resourceContent === 'object' && resourceContent !== null) {
          Object.entries(resourceContent).forEach(([resourceName, resourceUrl]: [string, any]) => {
            // Skip if it's an object (another level of nesting)
            if (typeof resourceUrl !== 'string') {
              // Handle deeper nesting (e.g., "Atul sir Notes" -> { "UNIT 1": { ... } })
              if (typeof resourceUrl === 'object' && resourceUrl !== null) {
                Object.entries(resourceUrl).forEach(([unitName, unitUrl]: [string, any]) => {
                  if (typeof unitUrl === 'string' && unitUrl.startsWith('http')) {
                    const material: DefaultMaterial = {
                      id: `default-${subjectName}-${resourceType}-${resourceName}-${unitName}`.replace(
                        /\s+/g,
                        '-'
                      ),
                      subject_name: `${subjectName} - ${resourceName} - ${unitName}`,
                      category: categoryMapping,
                      year: '',
                      material_url: unitUrl,
                      description: `${resourceType}: ${resourceName} - ${unitName} for ${subjectName}`,
                      tags: [subjectName, resourceType, semesterName, unitName],
                      uploader_username: 'studiy-admin',
                      created_at: new Date('2025-01-01').toISOString(),
                      status: 'approved',
                      isDefault: true,
                      semester: semesterName,
                      credits,
                      subjectcode,
                    };
                    materials.push(material);
                  }
                });
              }
              return;
            }

            // Direct URL
            if (resourceUrl.startsWith('http')) {
              const material: DefaultMaterial = {
                id: `default-${subjectName}-${resourceType}-${resourceName}`.replace(/\s+/g, '-'),
                subject_name: `${subjectName} - ${resourceName}`,
                category: categoryMapping,
                year: '',
                material_url: resourceUrl,
                description: `${resourceType}: ${resourceName} for ${subjectName}`,
                tags: [subjectName, resourceType, semesterName],
                uploader_username: 'studiy-admin',
                created_at: new Date('2025-01-01').toISOString(),
                status: 'approved',
                isDefault: true,
                semester: semesterName,
                credits,
                subjectcode,
              };
              materials.push(material);
            }
          });
        }
      });
    });
  });

  return materials;
};

/**
 * Get unique subjects from default data
 */
export const getDefaultSubjects = (): string[] => {
  const subjects = new Set<string>();
  const baseData = rawData.home;

  Object.values(baseData).forEach((semesterData: any) => {
    Object.keys(semesterData).forEach((subject) => {
      if (subject !== 'credits' && subject !== 'subjectcode') {
        subjects.add(subject);
      }
    });
  });

  return Array.from(subjects);
};

/**
 * Get materials for a specific subject
 */
export const getDefaultMaterialsBySubject = (subjectName: string): DefaultMaterial[] => {
  return getDefaultMaterialsFromData().filter((m) => m.subject_name.includes(subjectName));
};

/**
 * Get materials by semester
 */
export const getDefaultMaterialsBySemester = (semester: string): DefaultMaterial[] => {
  return getDefaultMaterialsFromData().filter((m) => m.semester === semester);
};
