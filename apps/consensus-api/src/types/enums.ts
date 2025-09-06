export enum ClubType {
  BOOK = 'book',
  MOVIE = 'movie',
  RESTAURANT = 'restaurant',
  TRAVEL = 'travel',
  GAMING = 'gaming',
  LEARNING = 'learning',
  EVENT = 'event',
  PODCAST = 'podcast',
  TV_SHOW = 'tv_show',
  MUSIC = 'music',
  OTHER = 'other'
}

export enum TurnOrder {
  SEQUENTIAL = 'sequential',
  RANDOM = 'random'
}

export enum TieBreakingMethod {
  RANDOM = 'random',
  RECOMMENDER_DECIDES = 'recommender_decides',
  RE_VOTE = 're_vote'
}

export enum RoundStatus {
  RECOMMENDING = 'recommending',
  VOTING = 'voting',
  COMPLETING = 'completing',
  FINISHED = 'finished'
}
