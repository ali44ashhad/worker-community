import User from "../models/user.model.js";
import ProviderProfile from "../models/providerProfile.model.js";
import ServiceOffering from "../models/serviceOffering.model.js";
import Comment from "../models/comment.model.js";
import InAppNotification from "../models/inAppNotification.model.js";
import PushSubscription from "../models/pushSubscription.model.js";
import MobilePushDevice from "../models/mobilePushDevice.model.js";
import InterestCommunityMembership from "../models/interestCommunityMembership.model.js";
import { deleteFromS3Safe, deleteS3AssetByUrl } from "./s3Upload.js";
import { invalidateCommentCaches } from "./reviewScope.js";

async function cleanupServiceAssets(service) {
    const jobs = [];
    for (const img of service.portfolioImages || []) {
        if (img?.public_id) jobs.push(deleteFromS3Safe(img.public_id));
        else if (img?.url) jobs.push(deleteS3AssetByUrl(img.url));
    }
    for (const pdf of service.portfolioPDFs || []) {
        if (pdf?.public_id) jobs.push(deleteFromS3Safe(pdf.public_id));
        else if (pdf?.url) jobs.push(deleteS3AssetByUrl(pdf.url));
    }
    await Promise.all(jobs);
}

/**
 * Hard-delete a customer or provider account.
 * Keeps community events, chat messages, and reviews they wrote on other services.
 * Removes provider listings and reviews on those listings.
 */
export async function deleteCustomerOrProviderAccount(user) {
    const userId = user._id;
    const profile = await ProviderProfile.findOne({ user: userId });

    if (profile) {
        const services = await ServiceOffering.find({ provider: profile._id });
        const serviceIds = services.map((service) => service._id);

        if (serviceIds.length) {
            await Comment.deleteMany({ serviceOffering: { $in: serviceIds } });
            await User.updateMany(
                { wishlist: { $in: serviceIds } },
                { $pull: { wishlist: { $in: serviceIds } } }
            );
        }

        await Promise.all(services.map((service) => cleanupServiceAssets(service)));
        await ServiceOffering.deleteMany({ provider: profile._id });
        await ProviderProfile.deleteOne({ _id: profile._id });
        invalidateCommentCaches();
    }

    await Promise.all([
        InAppNotification.deleteMany({ user: userId }),
        PushSubscription.deleteMany({ user: userId }),
        MobilePushDevice.deleteMany({ user: userId }),
        InterestCommunityMembership.deleteMany({ user: userId }),
    ]);

    if (user.profileImage) {
        await deleteS3AssetByUrl(user.profileImage);
    }

    await User.deleteOne({ _id: userId });
}
