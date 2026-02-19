import prisma from "../../../app/database";

// 1. Get Profile
export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { userId },
    select: {
      userId: true,
      userName: true,
      userEmail: true,
      phoneNumber: true,
      userAddress: true,
      aadharNumber: true,
      dob: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // We explicitly exclude 'password' here by NOT selecting it
    },
  });

  if (!user) throw new Error("User not found");
  return user;
};

// 2. Update Profile
export const updateUserProfile = async (userId: string, data: any) => {
  // Prevent updating sensitive fields like email, password, or role directly here
  // (Password/Email changes usually require separate flows with verification)
  const { password, userEmail, role, ...updatableData } = data;

  const updatedUser = await prisma.user.update({
    where: { userId },
    data: updatableData,
    select: {
      userId: true,
      userName: true,
      userEmail: true,
      phoneNumber: true,
      userAddress: true,
      aadharNumber: true,
      dob: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// 3. Delete Profile
export const deleteUserProfile = async (userId: string) => {
  // Note: If the user has Bookings, this might fail unless you have specific cascading rules.
  // For now, we assume a standard delete.
  await prisma.user.delete({
    where: { userId },
  });

  return { message: "User account deleted successfully" };
};