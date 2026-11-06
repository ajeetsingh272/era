import Link from "next/link";
import { PageBanner } from "@/components/site/PageBanner";

export default function NotFound() {
  return (
    <>
      <PageBanner title="Page not found" subtitle="The page you are looking for has moved or no longer exists." trail={["404"]} label="Error 404" />
      <section className="sec" id="content">
        <div className="wrap c btns">
          <Link className="btn" href="/">Back to home</Link>
          <Link className="lnk" href="/contact">Contact us</Link>
        </div>
      </section>
    </>
  );
}
