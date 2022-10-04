// Code to remove private pools, used in frames.js
// In a second file because of Chrome's CSP
var pools = Object.keys(Pool.pools);
if (pools.length > 0) {
    for (var i = 0; i < pools.length; i ++) {
        var pool = Pool.pools[pools[i]];
        if ((!pool.is_public && pool.user_id != User.get_current_user_id())) {
            document.getElementById('pool'+pool.id).style.display = "none";
        }
    }
}