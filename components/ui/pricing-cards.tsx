"use client";

import { useState } from "react";
import { ArrowRight, CircleCheck } from "lucide-react";
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
}
interface Pricing2Props {
  heading?: string;
  description?: string;
  plans?: PricingPlan[];
  onSelectPlan?: (planId: string) => void;
}

const Pricing2 = ({
  heading = "Plans & Pricing",
  description = "Choose the plan that matches your workflow and scale with ease.",
  plans = [],
  onSelectPlan,
}: Pricing2Props) => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="bg-[#FAFAFA] py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>
          <p className="text-sm text-[#888] max-w-md mx-auto">{description}</p>
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

        <div className="grid md:grid-cols-4 gap-4 md:gap-5">
          {plans.map((plan, i) => (
            <Card
              key={plan.id}
              className={`flex flex-col border-[#E8E8E8] ${
                i === 1 ? "md:scale-105 md:shadow-lg z-10" : ""
              }`}
            >
              <CardHeader>
                <CardTitle className="text-sm md:text-base font-bold">{plan.name}</CardTitle>
                {plan.description && (
                  <p className="text-xs text-[#888]">{plan.description}</p>
                )}
                <div className="mt-3">
                  <span className="text-2xl md:text-3xl font-bold">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-xs text-[#888] ml-1">
                    /{isYearly ? "year" : "month"}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <Separator className="mb-5 bg-[#F0F0F0]" />
                {i > 0 && (
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
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full rounded-xl text-sm inline-flex items-center justify-center h-12 px-6 font-semibold transition-all duration-150 active:scale-[0.98] ${
                      i === 1
                        ? "bg-black text-white hover:bg-[#1A1A1A]"
                        : "bg-white border border-[#E8E8E8] text-[#555] hover:border-black hover:text-black"
                    }`}
                  >
                    {plan.button.text}
                    <ArrowRight className="ml-2 size-4" />
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
          ))}
        </div>
      </div>
    </section>
  );
};

export { Pricing2 };
