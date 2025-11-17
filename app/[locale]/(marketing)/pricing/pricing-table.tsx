"use client";
import React from "react";
import { IconCheck } from "@tabler/icons-react";
import { useTranslations } from 'next-intl';

export function PricingTable() {
  const t = useTranslations('pricing');
  
  const CheckIcon = () => {
    return (
      <IconCheck className="mx-auto h-4 w-4 flex-shrink-0 text-foreground" />
    );
  };

  const tiers = [
    { id: 'free', name: t('tiers.free.name') },
    { id: 'starter', name: t('tiers.starter.name') },
    { id: 'professional', name: t('tiers.professional.name') },
    { id: 'enterprise', name: t('tiers.enterprise.name') }
  ];

  const tableFeatures = [
    {
      title: t('comparison.features.createAPIs'),
      free: <CheckIcon />,
      starter: <CheckIcon />,
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.accessToDashboard'),
      free: <CheckIcon />,
      starter: <CheckIcon />,
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.shareFunctionality'),
      free: <CheckIcon />,
      starter: <CheckIcon />,
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.playgroundEditor'),
      free: <CheckIcon />,
      starter: <CheckIcon />,
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.marketplaceAccess'),
      free: <CheckIcon />,
      starter: <CheckIcon />,
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.onCallSupport'),
      free: <CheckIcon />,
      starter: <CheckIcon />,
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.developerProgram'),
      starter: <CheckIcon />,
      free: <CheckIcon />,
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.advancedAnalytics'),
      free: t('comparison.values.onDemand'),
      starter: t('comparison.values.ifYouAskNicely'),
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.longRunningAPIs'),
      free: t('comparison.values.probablyNever'),
      starter: t('comparison.values.nuhUh'),
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.zeroDowntimeGuarantee'),
      free: "",
      starter: "",
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.customAnalytics'),
      free: "",
      starter: "",
      professional: <CheckIcon />,
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.singleSignOn'),
      free: "",
      starter: "",
      professional: "",
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.securityCertificate'),
      free: "",
      starter: "",
      professional: "",
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.retweetsFromUs'),
      free: "",
      starter: "",
      professional: "",
      enterprise: <CheckIcon />,
    },
    {
      title: t('comparison.features.weSendYouFlowers'),
      free: "",
      starter: "",
      professional: "",
      enterprise: <CheckIcon />,
    },
  ];

  return (
    <div className="mx-auto w-full relative z-20 px-4 py-40">
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-border">
              <thead className="">
                <tr>
                  <th
                    scope="col"
                    className="max-w-xs py-3.5 pl-4 pr-3 text-left text-3xl  font-extrabold text-foreground sm:pl-0"
                  ></th>
                  {tiers?.map((item, index) => (
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-center text-lg font-semibold text-foreground"
                      key={`pricing-${index}`}
                    >
                      {item.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableFeatures.map((feature) => (
                  <tr key={feature.title}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-foreground sm:pl-0">
                      {feature.title}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground text-center">
                      {feature.free}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground text-center">
                      {feature.starter}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground text-center">
                      {feature.professional}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-muted-foreground text-center">
                      {feature.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}