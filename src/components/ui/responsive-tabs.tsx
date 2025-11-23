"use client"

import * as React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ResponsiveTabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface ResponsiveTabsListProps {
  children: React.ReactElement[]
  className?: string
}

interface TabItem {
  value: string
  label: React.ReactNode
}

function ResponsiveTabs({ children, className, ...props }: ResponsiveTabsProps) {
  const [value, setValue] = React.useState(props.defaultValue || props.value || "")
  const [isMobile, setIsMobile] = React.useState(true) // Start with true to avoid hydration mismatch

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }
    // Only run on client
    if (typeof window !== "undefined") {
      checkMobile()
      window.addEventListener("resize", checkMobile)
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  React.useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value)
    }
  }, [props.value])

  const handleValueChange = React.useCallback((newValue: string) => {
    setValue(newValue)
    props.onValueChange?.(newValue)
  }, [props])

  // Extract tab items from children
  const tabItems: TabItem[] = React.useMemo(() => {
    const items: TabItem[] = []
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === ResponsiveTabsList) {
        const childProps = child.props as ResponsiveTabsListProps
        React.Children.forEach(childProps.children, (trigger) => {
          if (React.isValidElement(trigger)) {
            const triggerProps = trigger.props as { value?: string; children?: React.ReactNode }
            if (triggerProps.value) {
              items.push({
                value: triggerProps.value,
                label: triggerProps.children
              })
            }
          }
        })
      }
    })
    return items
  }, [children])

  return (
    <div className={cn("space-y-6", className)}>
      {/* Mobile: Show Select dropdown */}
      {isMobile && tabItems.length > 0 && (
        <Select value={value} onValueChange={handleValueChange}>
          <SelectTrigger className="w-full mb-4 md:hidden">
            <SelectValue>
              {tabItems.find(item => item.value === value)?.label || "Select tab"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tabItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Desktop: Show tabs */}
      <Tabs {...props} value={value} onValueChange={handleValueChange} className="space-y-6">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === ResponsiveTabsList) {
            // Hide TabsList on mobile, show on desktop
            const childProps = child.props as ResponsiveTabsListProps
            return React.cloneElement(child, {
              className: cn(childProps.className, "hidden md:flex")
            } as Partial<ResponsiveTabsListProps>)
          }
          return child
        })}
      </Tabs>
    </div>
  )
}

function ResponsiveTabsList({ children, className, ...props }: ResponsiveTabsListProps) {
  return (
    <TabsList 
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )} 
      {...props}
    >
      {children}
    </TabsList>
  )
}

const ResponsiveTabsTrigger = TabsTrigger
const ResponsiveTabsContent = TabsContent

export { ResponsiveTabs, ResponsiveTabsList, ResponsiveTabsTrigger, ResponsiveTabsContent }
