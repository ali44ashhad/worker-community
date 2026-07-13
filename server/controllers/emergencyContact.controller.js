import EmergencyContact from "../models/emergencyContact.model.js";

const normalizeTitle = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeOptional = (value) => String(value || "").trim();

const getSecretaryCommunityHandle = (secretary) =>
  secretary?.communName ? String(secretary.communName).trim().toLowerCase() : "";

/**
 * Secretary: list emergency contacts for this community
 * GET /api/secretary/emergency-contacts
 */
const listEmergencyContactsForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(200).json({
        success: true,
        data: { contacts: [], needsCommunName: true, communityCommunName: null },
      });
    }

    const contacts = await EmergencyContact.find({ communityCommunName: communityHandle })
      .sort({ title: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { contacts, needsCommunName: false, communityCommunName: communityHandle },
    });
  } catch (error) {
    console.error("listEmergencyContactsForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: create emergency contact
 * POST /api/secretary/emergency-contacts
 */
const createEmergencyContactForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const title = normalizeTitle(req.body?.title);
    const name = normalizeOptional(req.body?.name);
    const phone = normalizeOptional(req.body?.phone);
    const notes = normalizeOptional(req.body?.notes);

    if (!title) return res.status(400).json({ success: false, message: "Title is required." });
    if (!phone) return res.status(400).json({ success: false, message: "Phone number is required." });

    const contact = await EmergencyContact.create({
      communityCommunName: communityHandle,
      title,
      name,
      phone,
      notes,
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Emergency contact created.",
      data: { contact },
    });
  } catch (error) {
    console.error("createEmergencyContactForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Secretary: delete emergency contact
 * DELETE /api/secretary/emergency-contacts/:contactId
 */
const deleteEmergencyContactForSecretary = async (req, res) => {
  try {
    const communityHandle = getSecretaryCommunityHandle(req.user);
    if (!communityHandle) {
      return res.status(400).json({ success: false, message: "Set your Commun name first." });
    }

    const { contactId } = req.params;
    const contact = await EmergencyContact.findOne({ _id: contactId, communityCommunName: communityHandle });
    if (!contact) return res.status(404).json({ success: false, message: "Emergency contact not found." });

    await contact.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Emergency contact deleted.",
      data: { contactId },
    });
  } catch (error) {
    console.error("deleteEmergencyContactForSecretary:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

/**
 * Community (customer/provider): list emergency contacts for the joined community ONLY
 * GET /api/emergency-contacts/community
 */
const listEmergencyContactsForCommunity = async (req, res) => {
  try {
    const communityHandle = req.user?.communityCommunName ? String(req.user.communityCommunName).trim().toLowerCase() : "";
    if (!communityHandle) {
      return res.status(200).json({
        success: true,
        data: { contacts: [], needsCommunity: true, communityCommunName: null },
      });
    }

    const contacts = await EmergencyContact.find({ communityCommunName: communityHandle })
      .sort({ title: 1, createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: { contacts, needsCommunity: false, communityCommunName: communityHandle },
    });
  } catch (error) {
    console.error("listEmergencyContactsForCommunity:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export {
  listEmergencyContactsForSecretary,
  createEmergencyContactForSecretary,
  deleteEmergencyContactForSecretary,
  listEmergencyContactsForCommunity,
};

