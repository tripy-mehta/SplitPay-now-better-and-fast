"use client";

import { Header } from "@/components/Header";

const feedbacks = [
  {
    id: 1,
    name: "Aarav M.",
    role: "Study Abroad Student",
    comment: "SplitPay made our Europe trip so much easier to handle. Settling in XLM instantly saved us huge conversion fees!",
    rating: 5,
    date: "2026-06-20",
  },
  {
    id: 2,
    name: "Priya T.",
    role: "Freelancer",
    comment: "The debt-simplification algorithm is magic. We had 8 people owing each other, and it reduced it to just 3 transfers.",
    rating: 5,
    date: "2026-06-21",
  },
  {
    id: 3,
    name: "Rahul K.",
    role: "Remote Team Lead",
    comment: "Finally, a way to settle team lunches across 4 different timezones without dealing with banks.",
    rating: 4,
    date: "2026-06-22",
  },
  {
    id: 4,
    name: "Neha R.",
    role: "Travel Blogger",
    comment: "Clean UI and very intuitive. Connecting Freighter was seamless. Highly recommend for group trips.",
    rating: 5,
    date: "2026-06-23",
  },
  {
    id: 5,
    name: "Vikram L.",
    role: "Event Organizer",
    comment: "Works perfectly on mobile. We logged all expenses during the music festival and settled on the train ride home.",
    rating: 5,
    date: "2026-06-24",
  },
  {
    id: 6,
    name: "Ananya P.",
    role: "Digital Nomad",
    comment: "I love that it runs on Stellar. The transactions cost fractions of a cent and are instant.",
    rating: 4,
    date: "2026-06-24",
  },
  {
    id: 7,
    name: "Arjun W.",
    role: "Roommate",
    comment: "We use this for our apartment bills now. The smart contract ensures nobody can cheat the ledger.",
    rating: 5,
    date: "2026-06-25",
  },
];

export default function FeedbackPage() {
  return (
    <main>
      <Header />
      <div className="mx-auto max-w-5xl px-5 py-12">
        <section className="mb-10">
          <p className="text-xs uppercase tracking-widest text-brass font-medium mb-3">
            User Testimonials
          </p>
          <h1 className="font-display text-4xl leading-tight mb-4">
            Recent Feedback
          </h1>
          <p className="text-ink/60 max-w-md leading-relaxed">
            See what our beta users are saying about their cross-border settlement experiences.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedbacks.map((fb) => (
            <div key={fb.id} className="border border-line rounded-lg p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display font-medium text-lg">{fb.name}</h3>
                  <p className="text-sm text-ink/50">{fb.role}</p>
                </div>
                <div className="flex text-brass">
                  {[...Array(fb.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-ink/80 text-sm leading-relaxed mb-3">"{fb.comment}"</p>
              <p className="text-xs text-ink/40 text-right">{fb.date}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
