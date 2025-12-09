import type { FC } from 'react'
import { TabsContainer, Tab } from './Tabs.style'
import type { ITabsProps } from './Tabs.types'

export const Tabs: FC<ITabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <TabsContainer>
      {tabs.map((tab) => (
        <Tab
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </Tab>
      ))}
    </TabsContainer>
  )
}
