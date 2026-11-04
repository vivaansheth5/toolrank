import { footer, contact, site, commerce, ui } from "@/lib/site-config";
import { TLink } from "@/components/ui/TLink";
import { FooterWordmark } from "./FooterWordmark";
import { Clock } from "./Clock";
import { InstagramIcon, MailIcon, WhatsAppIcon } from "@/components/ui/Icons";
import { CableDivider } from "@/components/ui/CableDivider";
import { fill } from "@/lib/format";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer theme-night cv-auto" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">
        {site.name}
      </h2>
      <CableDivider />
      <div className="wrap footer-top">
        <div className="footer-cols">
          {footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title} className="footer-col">
              <p className="t-meta text-muted">{col.title}</p>
              <ul>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <TLink href={l.href} className="footer-link">
                      {l.label}
                    </TLink>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-side">
          <div>
            <p className="t-meta text-muted">{ui.shell.weTake}</p>
            <ul className="pay-row" aria-label="Payment methods">
              {commerce.paymentMethods.map((m) => (
                <li key={m} className="pay-chip">
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-social t-meta">
            <a href={contact.instagram} target="_blank" rel="noreferrer" aria-label={ui.shell.social.instagram}>
              <InstagramIcon size={16} /> <span>{ui.common.channels.instagram}</span>
            </a>
            <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noreferrer" aria-label={ui.shell.social.whatsapp}>
              <WhatsAppIcon size={16} /> <span>{ui.common.channels.whatsapp}</span>
            </a>
            <a href={`mailto:${contact.email}`} aria-label={ui.shell.social.email}>
              <MailIcon size={16} /> <span>{ui.common.channels.email}</span>
            </a>
          </div>
          <p className="t-meta footer-clock">
            <span className="live-dot" aria-hidden="true" /> <Clock prefix={`${site.city} `} />
          </p>
        </div>
      </div>
      <FooterWordmark />
      <div className="wrap footer-base t-meta">
        <span>{footer.copyright.replace("{year}", String(year))}</span>
        <span className="text-muted">{fill(ui.shell.madeIn, { country: site.country })}</span>
      </div>
    </footer>
  );
}
