import ControlPanel from './ControlPanel';

export default {
  title: 'Components/ControlPanel',
  component: ControlPanel,
  argTypes: {
    onAddItem: { action: 'onAddItem' },
    onClearAll: { action: 'onClearAll' },
    onRemoveItem: { action: 'onRemoveItem' },
  },
};

export const Default = {
  args: {},
};
