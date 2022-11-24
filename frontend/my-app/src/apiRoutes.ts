

let urlOfSocketConnection: string

if(!process.env.NODE_ENV || process.env.NODE_ENV === 'development') urlOfSocketConnection = "http://localhost:8000" 
else urlOfSocketConnection = "https://message-backend-app-production.up.railway.app"

const BaseUrlOfApi: string =  urlOfSocketConnection + "/api/v1/"
const urlOfSignUp: string = BaseUrlOfApi + "sign-up"
const urlOfLogin: string = BaseUrlOfApi + "login"
const urlOfPostMessage: string = BaseUrlOfApi + "message/channel/id/"
const urlOfDeleteMessage: string = BaseUrlOfApi + "message/id/"
const urlOfUserData: string = BaseUrlOfApi + "user/info"
const urlOfUserInvites: string = BaseUrlOfApi + "user/invites"
const urlOfMarkingInviteAsSeen: string = BaseUrlOfApi + "invite/mark-as-seen/id/"
const urlOfRespondingToInvite: string = BaseUrlOfApi + "invite/id/"
const urlOfUserChannels: string = BaseUrlOfApi + "user/channels"
const urlOfMessagesChannel: string = BaseUrlOfApi + "message/channel/id/"
const urlOfChannelData: string = BaseUrlOfApi + "channel/id/"
const urlOfEmojiReaction: string = BaseUrlOfApi + "emoji/message/id/"
const urlOfSendInvite: string = BaseUrlOfApi + "invite/channel/id/"
const urlOfCreateChannel: string = BaseUrlOfApi + "channel/create"
const urlOfMarkingLastMessageSeenInChannel: string = BaseUrlOfApi + "channel/mark-last-message/"
const ulrOfChangingUserPrivileges: string = BaseUrlOfApi + "channel/allowance/id/"
const urlOfChangePassword: string = BaseUrlOfApi + "user/password"
const urlOfInvitesSent: string = BaseUrlOfApi + "/user/invites-sent"
const urlOfSendingFriendInvite: string = BaseUrlOfApi + "/friend-invite"
const urlOfRespondingToFriendInvite: string = BaseUrlOfApi + "/friend-invite/id/"
const urlOfMarkingFriendInviteAsSeen: string = BaseUrlOfApi + "/friend-invite/mark-as-seen/id/"
const urlOfDeleteFriendShip: string = BaseUrlOfApi + "/user/friends/friendId/"
const urlOfListOfFriends: string = BaseUrlOfApi + "/user/friends"
const urlOfFriendInvitesSend: string = BaseUrlOfApi + "/user/friend-invites-sent"
const urlOfFriendInvitesReceived: string = BaseUrlOfApi + "/user/friend-invites"
const urlOfRemovingUser: string = BaseUrlOfApi + "/channel/removeUser/id/"
const urlOfLeavingChannel: string = BaseUrlOfApi + "/channel/leave/id/"
const urlOfDeletingChannel: string = BaseUrlOfApi + "/channel/delete/id/"


export {BaseUrlOfApi, urlOfLogin, urlOfPostMessage, urlOfSignUp, urlOfUserData, urlOfUserInvites, urlOfMarkingInviteAsSeen, 
        urlOfRespondingToInvite, urlOfUserChannels, urlOfMessagesChannel, urlOfSocketConnection, urlOfChannelData, urlOfDeleteMessage
        ,urlOfEmojiReaction, urlOfSendInvite, urlOfCreateChannel, urlOfMarkingLastMessageSeenInChannel, ulrOfChangingUserPrivileges,
        urlOfChangePassword, urlOfInvitesSent, urlOfSendingFriendInvite, urlOfMarkingFriendInviteAsSeen, urlOfDeleteFriendShip,
        urlOfListOfFriends, urlOfFriendInvitesReceived, urlOfFriendInvitesSend, urlOfRespondingToFriendInvite, urlOfRemovingUser, urlOfLeavingChannel,
        urlOfDeletingChannel}