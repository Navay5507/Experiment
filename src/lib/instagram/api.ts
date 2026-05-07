export class InstagramAPI {
  /**
   * Sends a standard Direct Message (DM) to an Instagram user.
   * This endpoint uses the newer Messenger API and strictly requires a JSON payload.
   */
  static async sendDM(recipientId: string, messageText: string, token: string, links?: string[]): Promise<any> {
    let finalMessageText = messageText;
    
    // Format links if provided
    if (links && links.length > 0) {
      const linksText = links.map((l, i) => links.length > 1 ? `${i + 1}. ${l}` : l).join('\n');
      finalMessageText += `\n\n🔗 ${links.length > 1 ? 'Links' : 'Link'}:\n${linksText}`;
    }

    const payload = {
      recipient: { id: recipientId },
      message: { text: finalMessageText }
    };

    const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    return await res.json();
  }

  /**
   * Sends a Quick Reply DM to an Instagram user.
   * This uses the Messenger API and strictly requires a JSON payload.
   */
  static async sendQuickReplyDM(recipientId: string, messageText: string, quickReplies: Array<{content_type: string, title: string, payload: string}>, token: string): Promise<any> {
    const payload = {
      recipient: { id: recipientId },
      messaging_type: 'RESPONSE',
      message: {
        text: messageText,
        quick_replies: quickReplies
      }
    };

    const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    return await res.json();
  }

  /**
   * Replies to a public comment on an Instagram Post or Reel.
   * This endpoint is a legacy Graph API edge and strictly requires URL-encoded Form Data.
   */
  static async replyToComment(commentId: string, messageText: string, token: string): Promise<any> {
    const params = new URLSearchParams();
    params.append('message', messageText);
    params.append('access_token', token);

    const res = await fetch(`https://graph.instagram.com/v21.0/${commentId}/replies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    return await res.json();
  }

  /**
   * Checks if a specific Instagram user follows the business account.
   */
  static async isUserFollowingBusiness(recipientId: string, token: string): Promise<boolean> {
    const res = await fetch(`https://graph.instagram.com/v21.0/${recipientId}?fields=is_user_follow_business&access_token=${token}`);
    const data = await res.json();
    return data.is_user_follow_business === true;
  }
  /**
   * Send a Private Reply to a commenter. Uses comment_id in recipient.
   * Private Reply ONLY supports plain TEXT messages.
   */
  static async sendPrivateReply(commentId: string, messageText: string, token: string): Promise<any> {
    const payload = {
      recipient: { comment_id: commentId },
      message: { text: messageText },
    };

    const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    return await res.json();
  }

  /**
   * Send a DM with clickable buttons using Instagram's Generic Template.
   */
  static async sendButtonTemplateDM(recipientId: string, messageText: string, buttons: { type: 'web_url' | 'postback'; title: string; url?: string; payload?: string }[], token: string): Promise<any> {
    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [
              {
                title: messageText,
                buttons: buttons
              }
            ]
          }
        }
      }
    };

    const res = await fetch(`https://graph.instagram.com/v21.0/me/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }
}
