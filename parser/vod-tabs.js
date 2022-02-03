/*
Name:
vod-tabs, implements Tabs \\

Description:
Used to display tab data, where each tab has a title, and optionally content.
if no content is supplied, tab data area is empty. \\

Properties:
#-- ```tabs```, empty array, ```Array<strings>```, any, an array that stores the string titles of each tab. If not supplied first tab's information is displayed and cannot be changed. --#
#-- ```selectedTab```,  ```0```, ```integer```, any ```integer```, a non-negative integer that specifies the index of the default tab to display. --#
\\

Examples:

Below are a few examples of tabs in action

$--
@@Simple one-to-one relationship between ```tabs``` and child components;
<vod-tabs tabs="{{['Tab 1', 'Tab 2', 'Tab 3']}}">
    <view slot="0">Information 1</view>
    <view slot="1">Information 2</view>
    <view slot="2">Information 3</view>
</vod-tabs>
--$
$--
@@No component with slot="2", therefore when user clicks on Tab 3, nothing is displayed;
<vod-tabs tabs="{{['Tab 1', 'Tab 2', 'Tab 3']}}">
    <view slot="0">Information 1</view>
    <image slot="1" mode="scaleToFill" src="/images/Get In Touch.svg"/>
</vod-tabs>
--$
\\

Children:
vod-tabs takes in children with a slot property defined. If the slot property is not defined, the child will be unreachable. children can be any component type. the slot property should be an index that corresponds to an element inside the tabs[] array. if slot is out of bounds, child will be unreachable.
\\

*/

