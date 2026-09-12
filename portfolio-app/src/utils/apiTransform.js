import { getProjectBySlug } from '../data/projects.js';

const skillCategoryIcons = {
    Frontend: 'bx-layout',
    Backend: 'bx-server',
    Databases: 'bx-data',
    'State & Auth': 'bx-lock-alt',
    Languages: 'bx-code-alt',
    'Tools & Platforms': 'bx-wrench',
};

const skillCategoryLabels = {
    frontend: 'Frontend',
    backend: 'Backend',
    database: 'Databases',
    databases: 'Databases',
    devops: 'Tools & Platforms',
    tools: 'Tools & Platforms',
    cloud: 'Tools & Platforms',
    languages: 'Languages',
    ai: 'Tools & Platforms',
};

function parseJsonList(value) {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    return [];
}

function pickList(primary, fallback = []) {
    return Array.isArray(primary) && primary.length > 0 ? primary : fallback;
}

function formatDisplayDate(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
    });
}

export function normalizeProfile(apiProfile = {}, fallbackProfile = {}, fallbackStats = []) {
    const socials = Array.isArray(apiProfile.socials) && apiProfile.socials.length > 0
        ? apiProfile.socials
        : fallbackProfile.socials || [];

    const typedRoles = Array.isArray(apiProfile.typingRoles)
        ? apiProfile.typingRoles.filter((role) => typeof role === 'string' && role.trim().length > 0)
        : [];

    const finalTypedRoles = typedRoles.length > 0 ? typedRoles : fallbackProfile.typedRoles || [];

    const stats = Array.isArray(apiProfile.stats) && apiProfile.stats.length > 0
        ? apiProfile.stats
            .map((item) => ({
                value: item?.value ?? '',
                label: item?.label ?? '',
            }))
            .filter(
                (item) =>
                    item.label?.toString().trim().length > 0 &&
                    item.value?.toString().trim().length > 0,
            )
        : [];
    const finalStats = stats.length > 0 ? stats : fallbackStats;

    return {
        ...fallbackProfile,
        name: apiProfile.name || fallbackProfile.name,
        title: apiProfile.designation || apiProfile.title || fallbackProfile.title,
        typedRoles: finalTypedRoles,
        email: apiProfile.email || fallbackProfile.email,
        about: apiProfile.about || fallbackProfile.about,
        socials,
        stats: finalStats,
        heroImage: apiProfile.coverPhotoUrl || fallbackProfile.heroImage,
        aboutImage: apiProfile.aboutImageUrl || fallbackProfile.aboutImage,
    };
}

function formatExperienceDuration(startDate, endDate, isCurrent) {
    if (!startDate) return '';
    const from = formatDisplayDate(startDate);
    const to = isCurrent || !endDate ? 'Present' : formatDisplayDate(endDate);
    return `${from} - ${to}`;
}

export function normalizeSkillGroups(skills = []) {
    const groups = skills.reduce((acc, skill) => {
        const rawCategory = skill.category || 'Other';
        const title = skillCategoryLabels[rawCategory] || rawCategory;
        const icon = skillCategoryIcons[title] || 'bx-star';
        const existing = acc[title] || { category: title, icon, skills: [] };
        if (skill.name && !existing.skills.includes(skill.name)) {
            existing.skills.push(skill.name);
        }
        acc[title] = existing;
        return acc;
    }, {});

    return Object.values(groups);
}

export function normalizeExperiences(experiences = []) {
    return experiences.map((item) => ({
        company: item.company || item.company_name || '',
        role: item.job_title || item.role || '',
        duration: formatExperienceDuration(item.start_date, item.end_date, item.current_company),
        location: item.location || '',
        responsibilities: parseJsonList(item.responsibilities),
        technologies: parseJsonList(item.technologies).map((tech) => typeof tech === 'string' ? tech : tech?.name).filter(Boolean),
    }));
}

export function normalizeEducationEntries(entries = []) {
    if (!Array.isArray(entries) || entries.length === 0) {
        return null;
    }

    const entry = entries[0];
    const startDate = formatDisplayDate(entry.start_date);
    const endDate = formatDisplayDate(entry.end_date);
    const duration = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || '';

    return {
        college: entry.college || entry.university || '',
        degree: entry.degree || '',
        duration,
        cgpa: entry.cgpa || entry.percentage || '',
        location: entry.location || entry.university || entry.college || '',
        coursework: parseJsonList(entry.coursework),
    };
}

export function normalizeProjectList(projects = [], fallbackProjects = []) {
    return projects.map((item) => {
        const fallback = getProjectBySlug(item.slug) || fallbackProjects.find((project) => project.slug === item.slug);
        const rawTechnologies = Array.isArray(item.technologies) ? item.technologies : parseJsonList(item.technologies);
        const rawGallery = Array.isArray(item.gallery) ? item.gallery : parseJsonList(item.gallery);
        const technologies = rawTechnologies
            .map((tech) => (typeof tech === 'string' ? tech : tech?.name || ''))
            .filter(Boolean);
        const gallery = rawGallery
            .map((galleryItem) => galleryItem.url || galleryItem.mediaUrl || galleryItem.media_id || backdropAsString(galleryItem))
            .filter(Boolean);

        return {
            slug: item.slug,
            title: item.name || fallback?.title || '',
            subtitle: item.subtitle || fallback?.subtitle || '',
            shortDescription: item.short_description || fallback?.shortDescription || '',
            description: item.full_description || fallback?.description || '',
            image: item.cover_url || item.thumbnail_url || fallback?.image || '',
            accent: item.cover_title || fallback?.accent || '',
            techStack: pickList(technologies, fallback?.techStack || []),
            features: pickList(parseJsonList(item.features), fallback?.features || []),
            challenges: pickList(parseJsonList(item.challenges), fallback?.challenges || []),
            screenshots: pickList(gallery, fallback?.screenshots || []),
            githubUrl: item.github_url || fallback?.githubUrl || '',
            liveUrl: item.live_url || fallback?.liveUrl || '',
            duration: item.completion_date ? formatDisplayDate(item.completion_date) : fallback?.duration || '',
            role: item.role || fallback?.role || '',
            futureImprovements: pickList(parseJsonList(item.future_improvements), fallback?.futureImprovements || []),
            note: item.note || fallback?.note || '',
            status: item.status || fallback?.status || 'completed',
            featured: Boolean(item.featured ?? fallback?.featured),
            companyProject: Boolean(item.company_project ?? fallback?.companyProject),
            responsibilities: pickList(parseJsonList(item.responsibilities), fallback?.responsibilities || []),
        };
    });
}

function backdropAsString(value) {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') return value.mediaId || value.altText || '';
    return '';
}

export function normalizeProjectDetail(project = {}, fallbackProject = null) {
    const base = normalizeProjectList([project], fallbackProject ? [fallbackProject] : [fallbackProject])[0];

    if (!base) {
        return null;
    }

    return {
        ...base,
        techStack: pickList(
            project.technologies && Array.isArray(project.technologies)
                ? project.technologies.map((item) => item.name || item.title || item.label || '').filter(Boolean)
                : [],
            base.techStack,
        ),
        screenshots: pickList(
            project.gallery && Array.isArray(project.gallery)
                ? project.gallery.map((item) => item.url || item.mediaUrl || item.media_id || item.altText || '').filter(Boolean)
                : [],
            base.screenshots,
        ),
    };
}
