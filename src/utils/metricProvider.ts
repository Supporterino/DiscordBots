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

export const moveRequests = io.counter({
  name: 'Number of Move Requests',
  id: 'requests/moveRequests'
});

export const Renames = io.counter({
  name: 'Number of renames executed on the server',
  id: 'requests/renameRequests'
});

export const VotingProcedures = io.counter({
  name: 'Number of started VotingProcedures',
  id: 'requests/votingProcedures'
});

export const successfulVotingProcedures = io.counter({
  name: 'Number of successful VotingProcedures',
  id: 'requests/successfulVotingProcedures'
});
