import { notFound, redirect } from "next/navigation";
import { getCurrentUser, getCurrentRole } from "@/lib/auth/session";
import { getBookingDetailsAction } from "@/features/bookings/actions";
import { CheckoutClient } from "./CheckoutClient";

interface CheckoutPageProps {
  params: {
    bookingId: string;
  };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirectTo=/checkout/${params.bookingId}`);
  }

  const role = await getCurrentRole();
  const res = await getBookingDetailsAction(params.bookingId);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <CheckoutClient booking={res.data} currentUserRole={role} />
    </div>
  );
}
