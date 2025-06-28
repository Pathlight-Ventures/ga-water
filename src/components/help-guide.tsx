"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Map, Search, BarChart3, Settings, MessageCircle } from "lucide-react";

export function HelpGuide() {
  const [open, setOpen] = useState(false);

  const features = [
    {
      icon: <Map className="h-5 w-5" />,
      title: "Interactive Map",
      description: "Explore water systems geographically. Click on markers to view detailed information about violations, compliance status, and system details.",
      tips: [
        "Use the map to find water systems in your area",
        "Click markers for detailed system information",
        "Filter by violation types or compliance status"
      ]
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Search & Filter",
      description: "Search for specific water systems by name, location, or violation type. Use advanced filters to narrow down results.",
      tips: [
        "Search by system name or location",
        "Filter by violation severity",
        "Sort by compliance status or violation count"
      ]
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Analytics Dashboard",
      description: "View comprehensive analytics and trends in water quality data, violation patterns, and compliance rates across Georgia.",
      tips: [
        "View violation trends over time",
        "Compare compliance rates across regions",
        "Analyze water quality parameter distributions"
      ]
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "AI Assistant",
      description: "Get help understanding water quality data, regulations, and system information through our AI-powered chat assistant.",
      tips: [
        "Ask questions about water safety standards",
        "Get explanations of violation types",
        "Learn about regulatory requirements"
      ]
    },
    {
      icon: <Settings className="h-5 w-5" />,
      title: "Settings & Preferences",
      description: "Customize your experience with notification settings, data preferences, and display options.",
      tips: [
        "Set up alerts for new violations",
        "Customize map display options",
        "Manage your account preferences"
      ]
    }
  ];

  const dataExplanation = [
    {
      term: "SDWIS",
      definition: "Safe Drinking Water Information System - EPA&apos;s database containing information about public water systems and their violations."
    },
    {
      term: "Violations",
      definition: "Instances where water systems fail to meet federal drinking water standards or reporting requirements."
    },
    {
      term: "MCL",
      definition: "Maximum Contaminant Level - The highest level of a contaminant allowed in drinking water."
    },
    {
      term: "Compliance",
      definition: "The status of a water system meeting all applicable drinking water regulations and standards."
    }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          How to Use
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Georgia Drinking Water Data Explorer Guide
            <Badge variant="secondary" className="ml-auto">Q1 2025</Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Overview */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Overview</h3>
              <p className="text-sm text-gray-600 mb-4">
                This application provides access to Georgia&apos;s public water system data from the EPA&apos;s Safe Drinking Water Information System (SDWIS). 
                Explore water quality violations, compliance data, and system information to understand the safety and quality of drinking water across the state.
              </p>
            </section>

            {/* Features */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Key Features</h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-600 mt-0.5">
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1">{feature.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <div className="space-y-1">
                          {feature.tips.map((tip, tipIndex) => (
                            <div key={tipIndex} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-xs text-gray-500">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Data Terms */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Understanding the Data</h3>
              <div className="space-y-3">
                {dataExplanation.map((item, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-4">
                    <dt className="font-medium text-sm">{item.term}</dt>
                    <dd className="text-sm text-gray-600 mt-1">{item.definition}</dd>
                  </div>
                ))}
              </div>
            </section>

            {/* Tips */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Pro Tips</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Use the chat assistant (💬 icon) for quick answers about water safety and regulations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Bookmark specific water systems for easy access to their data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Export data for further analysis in spreadsheet applications</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Set up notifications to stay informed about new violations in your area</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
              <p className="text-sm text-gray-600">
                If you have questions about the data or need assistance using the application, 
                use the chat assistant (💬 icon in the bottom right) or contact our support team.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 