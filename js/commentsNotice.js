try {
    let lvl = User.get_current_user_level();

    if (lvl && lvl < 20) {
        if (document.querySelector('div[id^="reply-"] form')) {
            const notice = document.createElement('div');
            notice.classList.add('status-notice', 'comment-notice');
            notice.innerText = "To maintain the quality of the comments section, please only share relevant information such as animator credits, production details, or constructive insights. Please refrain from discussing spoilers or engaging in plot-centered discussions.";
            document.querySelector('div[id^="reply-"]').insertBefore(notice, document.querySelector('div[id^="reply-"] form'));
        }
    }
} catch {

}