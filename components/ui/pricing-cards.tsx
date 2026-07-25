"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck, Tag, Sparkles, Check, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface PricingFeature {
  text: string;
}
interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
  offerLabel?: string | null;
  originalPrice?: string | null;
  savings?: string | null;
}
interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
  onSelectPlan?: (planId: string, isYearly: boolean) => void;
  /** Subscription page: id of the current plan to highlight */
  currentPlanId?: string;
  /** Subscription page: whether current plan is expired */
  isExpired?: boolean;
}

const Pricing2 = ({
  heading = "Plans & Pricing",
  description = "Choose the plan that matches your workflow and scale with ease.",
  plans = [],
  onSelectPlan,
  currentPlanId,
  isExpired,
}: Pricing2Props) => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="bg-[#FAFAFA] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5">
        {(heading || description) && (
          <div className="text-center mb-12">
            {heading && <h2 className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>}
            {description && <p className="speakable-pricing-desc text-sm text-[#888] max-w-md mx-auto">{description}</p>}
            {plans.length > 1 && (
              <div className="mt-6 inline-flex items-center gap-3 text-sm bg-white border border-[#E8E8E8] rounded-full px-4 py-2">
                <span className={!isYearly ? "font-semibold text-black" : "text-[#888]"}>Monthly</span>
                <Switch
                  checked={isYearly}
                  onCheckedChange={() => setIsYearly(!isYearly)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-[#DDD]"
                />
                <span className={isYearly ? "font-semibold text-black" : "text-[#888]"}>Yearly</span>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {plans.map((plan, i) => {
            const showOfferBadge = isYearly && plan.offerLabel
            const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice
            const displayPeriod = isYearly ? "/year" : "/month"
            const isCurrentPlan = currentPlanId === plan.id
            const isCurrentPlanExpired = isCurrentPlan && isExpired

            return (
              <Card
                key={plan.id}
                className={`flex flex-col relative transition-all duration-200 ${
                  isCurrentPlan
                    ? "border-[#25D366] ring-1 ring-[#25D366]/30 shadow-md"
                    : i === 1 && !currentPlanId
                    ? "border-[#E8E8E8] sm:scale-105 sm:shadow-lg z-10"
                    : "border-[#E8E8E8]"
                } ${isCurrentPlanExpired ? "ring-[#DC2626]/30 border-[#DC2626]/40" : ""}`}
              >
                {/* Current Plan Badge */}
                {isCurrentPlan && !isCurrentPlanExpired && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-[#25D366] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      <Check className="w-3 h-3" />
                      Current Plan
                    </span>
                  </div>
                )}
                {isCurrentPlanExpired && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 bg-[#DC2626] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      <AlertTriangle className="w-3 h-3" />
                      Expired — Renew
                    </span>
                  </div>
                )}
                {/* Offer Badge (only if not already showing current plan badge) */}
                {showOfferBadge && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <span className="inline-flex items-center gap-1 bg-[#25D366] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      <Tag className="w-3 h-3" />
                      {plan.offerLabel}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-sm md:text-base font-bold">{plan.name}</CardTitle>
                  {plan.description && (
                    <p className="text-xs text-[#888]">{plan.description}</p>
                  )}
                  <div className="mt-3">
                    {isYearly && plan.originalPrice ? (
                      <span className="text-sm text-[#999] line-through mr-2">{plan.originalPrice}</span>
                    ) : null}
                    <span className="text-2xl md:text-3xl font-bold">
                      {displayPrice}
                    </span>
                    <span className="text-xs text-[#888] ml-1">
                      {displayPeriod}
                    </span>
                    {isYearly && plan.savings && (
                      <div className="mt-1 text-[11px] font-semibold text-[#0D7A33] flex items-center gap-1 justify-center">
                        <Sparkles className="w-3 h-3" />
                        {plan.savings}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Separator className="mb-5 bg-[#F0F0F0]" />
                  {i > 0 && !currentPlanId && (
                    <p className="mb-3 text-xs font-semibold text-[#555]">
                      Everything in {plans[i - 1].name}, and:
                    </p>
                  )}
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CircleCheck className="w-4 h-4 text-[#16A34A] shrink-0 mt-0.5" />
                        <span className="text-[#333]">{feature.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter className="mt-auto">
                  {onSelectPlan ? (
                    <button
                      onClick={() => onSelectPlan(plan.id, isYearly)}
                      disabled={isCurrentPlan && !isCurrentPlanExpired}
                      className={`w-full rounded-xl text-sm inline-flex items-center justify-center h-12 px-6 font-semibold transition-all duration-150 active:scale-[0.98] ${
                        isCurrentPlan && !isCurrentPlanExpired
                          ? "bg-[#25D366]/10 border border-[#25D366]/30 text-[#1A8C3F] cursor-default"
                          : isCurrentPlanExpired
                          ? "bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                          : i === 1 && !currentPlanId
                          ? "bg-black text-white hover:bg-[#1A1A1A]"
                          : "bg-white border border-[#E8E8E8] text-[#555] hover:border-black hover:text-black"
                      }`}
                    >
                      {isCurrentPlan && !isCurrentPlanExpired ? (
                        <><ShieldCheck className="w-4 h-4 mr-1.5" /> Active</>
                      ) : (
                        <>
                          {plan.button.text}
                          <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <Link
                      href={plan.button.url}
                      className={`w-full rounded-xl text-sm inline-flex items-center justify-center h-12 px-6 font-semibold transition-all duration-150 active:scale-[0.98] ${
                        i === 1
                          ? "bg-black text-white hover:bg-[#1A1A1A]"
                          : "bg-white border border-[#E8E8E8] text-[#555] hover:border-black hover:text-black"
                      }`}
                    >
                      {plan.button.text}
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export { Pricing2 };
