import { ReportData, VehicleTrip } from '@/types';
import { google } from 'googleapis';

// Google Drive API types
interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  size?: string;
}

interface StorageQuota {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

// Google Drive authentication
const getGoogleAuth = () => {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  return new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
    ],
  });
};

const drive = google.drive('v3');

export class GoogleDriveService {
  private auth;
  private folderId: string;

  constructor() {
    this.auth = getGoogleAuth();
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || '';
  }

  // Tạo thư mục mới
  async createFolder(name: string, parentFolderId?: string): Promise<string | null> {
    try {
      const response = await drive.files.create({
        auth: this.auth,
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: parentFolderId ? [parentFolderId] : undefined,
        },
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Error creating folder:', error);
      return null;
    }
  }

  // Upload file
  async uploadFile(
    fileName: string,
    fileContent: string | Buffer,
    mimeType: string,
    parentFolderId?: string,
  ): Promise<string | null> {
    try {
      const response = await drive.files.create({
        auth: this.auth,
        requestBody: {
          name: fileName,
          parents: parentFolderId ? [parentFolderId] : [this.folderId],
        },
        media: {
          mimeType,
          body: fileContent.toString(),
        },
      });

      console.log(`File ${fileName} uploaded successfully. ID: ${response.data.id}`);
      return response.data.id || null;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  }

  // Upload PDF báo cáo
  async uploadReportPDF(
    reportData: ReportData,
    pdfBuffer: Buffer,
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  ): Promise<string | null> {
    try {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const fileName = `${reportType}_report_${dateStr}.pdf`;

      // Tạo thư mục theo năm nếu chưa có
      const year = date.getFullYear().toString();
      const yearFolderId = await this.getOrCreateYearFolder(year);

      // Tạo thư mục theo tháng
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthFolderId = await this.getOrCreateMonthFolder(month, yearFolderId);

      // Upload file
      const fileId = await this.uploadFile(fileName, pdfBuffer, 'application/pdf', monthFolderId);

      if (fileId) {
        console.log(`Report PDF uploaded: ${fileName} (ID: ${fileId})`);
      }

      return fileId;
    } catch (error) {
      console.error('Error uploading report PDF:', error);
      return null;
    }
  }

  // Upload Excel báo cáo
  async uploadReportExcel(
    reportData: ReportData,
    excelBuffer: Buffer,
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
  ): Promise<string | null> {
    try {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const fileName = `${reportType}_report_${dateStr}.xlsx`;

      // Tạo thư mục theo năm nếu chưa có
      const year = date.getFullYear().toString();
      const yearFolderId = await this.getOrCreateYearFolder(year);

      // Tạo thư mục theo tháng
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const monthFolderId = await this.getOrCreateMonthFolder(month, yearFolderId);

      // Upload file
      const fileId = await this.uploadFile(
        fileName,
        excelBuffer,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        monthFolderId,
      );

      if (fileId) {
        console.log(`Report Excel uploaded: ${fileName} (ID: ${fileId})`);
      }

      return fileId;
    } catch (error) {
      console.error('Error uploading report Excel:', error);
      return null;
    }
  }

  // Backup dữ liệu chuyến xe
  async backupTripData(tripData: VehicleTrip[]): Promise<string | null> {
    try {
      const date = new Date();
      const dateStr = date.toISOString().split('T')[0];
      const fileName = `trip_backup_${dateStr}.json`;

      const jsonContent = JSON.stringify(tripData, null, 2);

      // Tạo thư mục backup
      const backupFolderId = await this.getOrCreateBackupFolder();

      // Upload file
      const fileId = await this.uploadFile(
        fileName,
        jsonContent,
        'application/json',
        backupFolderId,
      );

      if (fileId) {
        console.log(`Trip data backup uploaded: ${fileName} (ID: ${fileId})`);
      }

      return fileId;
    } catch (error) {
      console.error('Error backing up trip data:', error);
      return null;
    }
  }

  // Lấy danh sách files trong thư mục
  async listFiles(folderId?: string): Promise<DriveFile[]> {
    try {
      const response = await drive.files.list({
        auth: this.auth,
        q: folderId ? `parents in '${folderId}'` : `parents in '${this.folderId}'`,
        fields: 'files(id, name, mimeType, createdTime, size)',
        orderBy: 'createdTime desc',
      });

      return (response.data.files || []).map((file) => ({
        id: file.id || '',
        name: file.name || '',
        mimeType: file.mimeType || '',
        createdTime: file.createdTime || '',
        size: file.size || undefined,
      }));
    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // Xóa file
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await drive.files.delete({
        auth: this.auth,
        fileId,
      });

      console.log(`File deleted: ${fileId}`);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Tải file
  async downloadFile(fileId: string): Promise<Buffer | null> {
    try {
      const response = await drive.files.get({
        auth: this.auth,
        fileId,
        alt: 'media',
      });

      return Buffer.from(response.data as string);
    } catch (error) {
      console.error('Error downloading file:', error);
      return null;
    }
  }

  // Chia sẻ file (public link)
  async shareFile(fileId: string): Promise<string | null> {
    try {
      // Cấp quyền truy cập công khai
      await drive.permissions.create({
        auth: this.auth,
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Lấy link chia sẻ
      const file = await drive.files.get({
        auth: this.auth,
        fileId,
        fields: 'webViewLink',
      });

      return file.data.webViewLink || null;
    } catch (error) {
      console.error('Error sharing file:', error);
      return null;
    }
  }

  // Dọn dẹp files cũ (xóa files quá 30 ngày)
  async cleanupOldFiles(): Promise<number> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const query = `parents in '${this.folderId}' and createdTime < '${thirtyDaysAgo.toISOString()}'`;

      const response = await drive.files.list({
        auth: this.auth,
        q: query,
        fields: 'files(id, name, createdTime)',
      });

      const oldFiles = response.data.files || [];
      let deletedCount = 0;

      for (const file of oldFiles) {
        if (file.id) {
          const deleted = await this.deleteFile(file.id);
          if (deleted) deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} old files`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old files:', error);
      return 0;
    }
  }

  // Lấy thông tin storage
  async getStorageInfo(): Promise<StorageQuota | null> {
    try {
      const response = await drive.about.get({
        auth: this.auth,
        fields: 'storageQuota',
      });

      const quota = response.data.storageQuota;
      return {
        limit: quota?.limit,
        usage: quota?.usage,
        usageInDrive: quota?.usageInDrive,
        usageInDriveTrash: quota?.usageInDriveTrash,
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }

  // Helper: Lấy hoặc tạo thư mục theo năm
  private async getOrCreateYearFolder(year: string): Promise<string> {
    try {
      // Tìm thư mục năm
      const response = await drive.files.list({
        auth: this.auth,
        q: `parents in '${this.folderId}' and name='${year}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id!;
      }

      // Tạo thư mục mới
      const folderId = await this.createFolder(year, this.folderId);
      return folderId || this.folderId;
    } catch (error) {
      console.error('Error getting/creating year folder:', error);
      return this.folderId;
    }
  }

  // Helper: Lấy hoặc tạo thư mục theo tháng
  private async getOrCreateMonthFolder(month: string, parentFolderId: string): Promise<string> {
    try {
      // Tìm thư mục tháng
      const response = await drive.files.list({
        auth: this.auth,
        q: `parents in '${parentFolderId}' and name='${month}' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id!;
      }

      // Tạo thư mục mới
      const folderId = await this.createFolder(month, parentFolderId);
      return folderId || parentFolderId;
    } catch (error) {
      console.error('Error getting/creating month folder:', error);
      return parentFolderId;
    }
  }

  // Helper: Lấy hoặc tạo thư mục backup
  private async getOrCreateBackupFolder(): Promise<string> {
    try {
      // Tìm thư mục backup
      const response = await drive.files.list({
        auth: this.auth,
        q: `parents in '${this.folderId}' and name='backups' and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id!;
      }

      // Tạo thư mục mới
      const folderId = await this.createFolder('backups', this.folderId);
      return folderId || this.folderId;
    } catch (error) {
      console.error('Error getting/creating backup folder:', error);
      return this.folderId;
    }
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
