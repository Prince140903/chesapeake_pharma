import { ContactForm } from "./contact-form";
import { getSiteContentAction } from "@/app/admin/content-actions";
import { ContactPageContent, defaultContactPageContent } from "@/lib/content-schema";

export const revalidate = 0; // Dynamic route

export default async function ContactPage() {
  const contentRes = await getSiteContentAction<ContactPageContent>("contact");
  const content: ContactPageContent = contentRes?.data || defaultContactPageContent;

  return <ContactForm content={content} />;
}
