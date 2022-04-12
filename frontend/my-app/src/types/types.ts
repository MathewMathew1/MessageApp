
export type UserInfo = {
    id: string;
    username: string;
    join_date: string
} 

export type UserInvites = {
    id: string;
    user_invited_id: number;
    user_inviting_id: number;
    seen_by_user_invited: boolean;
    channel_id: number;
    channel_name: string
    date_of_creation: string
    username: string;
    member_count: number
} 

export type FriendInvites = {
    id: string,
    invite_date: string,
    seen_by_user_invited: boolean,
    user_invited_id: string,
    user_inviting_id: string,
    username: string,
} 

export type FriendshipWithOutlookFromUser = {
    isOnline: boolean
    start_of_friendship: string,
    user_one_id: string,
    user_two_id: string,
    username: string,
}

export type UserChannel = {
    user_id: number;
    channel_id: number;
    is_owner_of_channel: boolean;
    can_invite: boolean;
    join_date: string;
    id: string;
    name: string;
    date_of_creation: string;
}

export type Message = {
    channel_id: number
    date_of_posting: string
    edited_on: string|null
    id: string
    message_text: string
    user_id: number
    username: string
    emojis: EmojiInfo
}


export type EditedMessageContent = {
    editedTime: string|null
    messageId: string
    editedText: string
}

export type UserInChannel = {
    can_invite: boolean
    channel_id: number
    id: string
    is_owner_of_channel: boolean
    join_date: string
    username: string
    last_message_seen_id: null|number
}

export type ChannelInfo= {
    id: string
    name: string
    date_of_creation: string
}
  
export type EmojiInfo = {
    [name: string]: EmojiReactionInfo[]
}

export type EmojiReactionInfo = {
    username: string;
    userId: number;  
}

export type Friendship = {
    start_of_friendship: string,
    user_one_id: string,
    user_two_id: string,
    username_one: string,
    username_two: string,
    is_user_one_online: boolean
    is_user_two_online: boolean
}

export enum EmojiReaction {
    agree = "👍",
    disagree = "👎",
    loveIt = "😍",
    supperFunny = "😂",
    bigCry= "😭",
}

export enum InviteEnum {
    friend = "friend",
    channel = "channel"
}

export type MenuPosition = {
    mouseX: number;
    mouseY: number;
} | null

export type UserInContextMenu = {
    id: string,
    sameUserAsCurrentlyLogged?: boolean,
    username: string,
    isFriend: boolean,
    channelInfoInContext: {
        id: string,
        canKickUser: boolean
    }|null
}