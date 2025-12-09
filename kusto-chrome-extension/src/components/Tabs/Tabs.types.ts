export interface ITabItem {
  id: string
  label: string
}

export interface ITabsProps {
  tabs: ITabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
}
