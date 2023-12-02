// TODO: Comment notice
// To maintain the quality of discussions, kindly contribute purposeful and insightful comments. Please prioritize sharing relevant information such as animator credits, production details, or constructive insights. Please refrain from discussing spoilers or engaging in plot-centred discussions.

const comments = document.querySelectorAll('div.comment');

for (let comment of comments) {
    let displayAuthorTooltip;

    if (comment.querySelector('a[href^="/comment/edit/"]')) {
        comment.querySelector('a[href^="/comment/edit/"]').onclick = async function (e) {
            const link = this.href;
            const oldComment = comment.querySelector('.body').innerHTML;

            e.preventDefault();

            const res = await fetch(link);
            const text = await res.text();

            const parser = new DOMParser();
            const commentPage = parser.parseFromString(text, 'text/html');
            const content = commentPage.getElementById('comment-edit');
            content.querySelector('h4').remove();
            comment.querySelector('.body').innerHTML = content.innerHTML;

            const cancelButton = document.createElement('button');
            cancelButton.innerText = "Cancel";
            cancelButton.onclick = function () {
                comment.querySelector('.body').innerHTML = oldComment;
            }
            comment.querySelector('.body form').appendChild(cancelButton);

            comment.querySelector('.body form').onsubmit = async function (e) {
                e.preventDefault();

                const formData = new FormData();
                formData.append("authenticity_token", comment.querySelector('input[name="authenticity_token"]').value);
                formData.append("id", comment.querySelector('input[name="id"]').value);
                formData.append("comment[body]", comment.querySelector('#comment_body').value);
                formData.append("commit", "Save changes");

                const res = await fetch(comment.querySelector('form').action, { method: "POST", body: formData });
                window.location.reload();
            }
        }
    }

    comment.querySelector('.author h6 a').onmouseenter = function () {
        const author = this;
        displayAuthorTooltip = true;

        if (document.getElementById('author-tooltip')) {
            return;
        }

        setTimeout(async function () {
            if (document.getElementById('author-tooltip')) {
                return;
            }
            if (displayAuthorTooltip === false) {
                return;
            }

            const res = await fetch(author.href, { cache: "force-cache" });
            const text = await res.text();

            if (displayAuthorTooltip === false) {
                return;
            }

            const parser = new DOMParser();
            const authorPage = parser.parseFromString(text, 'text/html');
            const content = authorPage.getElementById('content');
            for (let div of content.querySelectorAll('div:nth-child(1n + 3)')) {
                div.remove();
            }
            for (let tr of content.querySelectorAll('tr')) {
                const td = tr.children[0].innerText.trim();
                if (td == "Tag Subscriptions" || td == "Note Edits" || td == "Wiki Edits" || td == "User Forum Posts" || td == "Recent Invites" || td == "IP") {
                    tr.remove();
                }
            }
            content.querySelector('h2').style.fontSize = "14px";
            content.querySelector('h2').style.marginBottom = "5px";
            content.querySelector('table').style.marginBottom = "0px";

            const authorTooltip = document.createElement('div');
            authorTooltip.id = "author-tooltip";
            authorTooltip.innerHTML = content.innerHTML;
            document.body.appendChild(authorTooltip);

            setTimeout(function () {
                authorTooltip.style.top = `${author.offsetTop - authorTooltip.offsetHeight - 5}px`;
                authorTooltip.style.left = `${author.offsetLeft - 5}px`;
            });
        }, 200);
    }

    comment.querySelector('.author h6 a').onmouseleave = function () {
        if (document.getElementById('author-tooltip')) {
            let tooltipEntered = false;
            document.getElementById('author-tooltip').onmouseenter = function () {
                tooltipEntered = true;

                document.getElementById('author-tooltip').onmouseleave = function () {
                    if (document.getElementById('author-tooltip')) document.getElementById('author-tooltip').remove();
                    displayAuthorTooltip = false;
                }
            }
            setTimeout(function () {
                if (!tooltipEntered) {
                    if (document.getElementById('author-tooltip')) document.getElementById('author-tooltip').remove();
                    displayAuthorTooltip = false;
                }
            }, 200);
        } else {
            displayAuthorTooltip = false;
        }
    }
}