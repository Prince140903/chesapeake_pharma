"use client";

import { FormEvent, useState } from "react";
import { Mail, MapPin, Send, Phone } from "lucide-react";
import { StatusLine } from "@/components/ui";
import { ContactPageContent } from "@/lib/content-schema";

export function ContactForm({ content }: { content: ContactPageContent }) {
  const [submitted, setSubmitted] = useState(false);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="container-shell py-20 lg:py-28">
      <div className="grid gap-16 lg:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 className="mt-5 text-5xl font-bold leading-tight text-navy">
            {content.title}
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted">
            {content.subtitle}
          </p>
          <div className="mt-10 grid gap-4 text-sm text-muted">
            <p className="flex gap-3">
              <Mail className="text-teal" size={18} />
              <a href={`mailto:${content.email}`} className="transition hover:text-teal font-semibold">
                {content.email}
              </a>
            </p>
            {content.location && (
              <p className="flex gap-3">
                <MapPin className="text-teal" size={18} /> {content.location}
              </p>
            )}
            {content.phone && (
              <p className="flex gap-3">
                <Phone className="text-teal" size={18} /> {content.phone}
              </p>
            )}
          </div>
        </div>

        <form onSubmit={submit} className="rounded-[26px] border border-line bg-white p-7 shadow-soft sm:p-9">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-navy">
              Your name
              <input required className="input-control mt-2" placeholder="Full name" />
            </label>
            <label className="text-sm font-semibold text-navy">
              Work email
              <input required type="email" className="input-control mt-2" placeholder="name@company.com" />
            </label>
          </div>
          <label className="mt-5 block text-sm font-semibold text-navy">
            Organization
            <input className="input-control mt-2" placeholder="Company or institution" />
          </label>
          <label className="mt-5 block text-sm font-semibold text-navy">
            How can we help?
            <textarea
              required
              rows={5}
              className="input-control mt-2 resize-y"
              placeholder="Tell us what you are trying to make clearer."
            />
          </label>
          {submitted && (
            <div className="mt-5">
              <StatusLine type="success">
                <span>
                  <strong>Thank you.</strong> Your message has been received and our advisory team will be in touch shortly.
                </span>
              </StatusLine>
            </div>
          )}
          <button className="button-primary mt-6 gap-2" type="submit">
            Send message <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

