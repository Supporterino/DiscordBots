import io from '@pm2/io';

export const activeChannels = io.metric({
  name: 'Active channels',
  id: 'channelregistry/active'
});

export const channelRequests = io.counter({
  name: 'number of ChannelReuests',
  id: 'requests/channelrequests'
});

export const voiceStates = io.counter({
  name: 'Nubmer of VoiceStateUpdates',
  id: 'requests/voicestateupdates'
});
