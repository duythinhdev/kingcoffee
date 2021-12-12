exports.updateAliasForAllPost = async () => {
    try{
      const posts = await DB.Post.find();
      if(posts && posts.length > 0){
        for(let i = 0; i < posts.length; i++){
          let post = posts[i];
          post.alias = Helper.App.removeAccents(post.title.trim().toLowerCase());
          await post.save();
        };
      }
     
    }catch(e){
      throw e;
    }
}