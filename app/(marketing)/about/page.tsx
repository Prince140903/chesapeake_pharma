import { Check, Compass, Eye, Scale } from "lucide-react";
import { SectionIntro } from "@/components/ui";
import { getSiteContentAction } from "@/app/admin/content-actions";
import { AboutPageContent, defaultAboutPageContent } from "@/lib/content-schema";

export const revalidate = 0; // Dynamic route

export default async function AboutPage() {
  const contentRes = await getSiteContentAction<AboutPageContent>("about");
  const content: AboutPageContent = contentRes?.data || defaultAboutPageContent;

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Eye":
        return <Eye className="text-teal" />;
      case "Scale":
        return <Scale className="text-teal" />;
      case "Compass":
      default:
        return <Compass className="text-teal" />;
    }
  };

  return (
    <div className="container-shell py-20 lg:py-28">
      <div className="grid gap-16 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight text-navy">
            {content.title}
          </h1>
        </div>
        <div>
          <p className="text-xl leading-8 text-ink">
            {content.intro_p1}
          </p>
          <p className="mt-6 text-base leading-7 text-muted">
            {content.intro_p2}
          </p>
        </div>
      </div>
      <div className="my-20 border-t border-line" />
      <SectionIntro
        eyebrow={content.principles_eyebrow}
        title={content.principles_title}
        text={content.principles_description}
      />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {(content.principles || []).map(({ icon, title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-line bg-white p-7 shadow-card"
          >
            {renderIcon(icon)}
            <h3 className="mt-8 text-xl font-bold text-navy">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 flex items-center gap-2 text-sm text-muted">
        <Check size={16} className="text-teal" /> {content.footnote}
      </div>
    </div>
  );
}
