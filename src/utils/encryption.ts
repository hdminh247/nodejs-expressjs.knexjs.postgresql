import bcrypt from "bcryptjs";

const encryption = {
  hashPassword: (password: string): string => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },

  checkPassword: (inputPassword: string, hashedPassword: string): boolean => {
    return bcrypt.compareSync(inputPassword, hashedPassword);
  },
};

export default encryption;
