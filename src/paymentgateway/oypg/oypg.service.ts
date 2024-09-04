import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OyAccountInquiry, OyAccountInquiryResponse, OyDisbursement, OyDisbursementResponse, OyDisbursementStatus, OyDisbursementStatusResponse, OyMyBalanceResponse, OyStaticVa, OyStaticVAInfo, OyStaticVaResponse } from './dto/OyDTO';

@Injectable()
export class OyPgService {

    constructor(private readonly httpService: HttpService, private readonly configService: ConfigService) { }

    async inquiryAccount(accountInfo: OyAccountInquiry): Promise<OyAccountInquiryResponse> {
        let config = { headers: { "x-oy-username": this.configService.get("OY_USERNAME"), "x-api-key": this.configService.get("OY_APIKEY") } };
        const res = await this.httpService.post(this.configService.get("OY_ENDPOINT") + 'account-inquiry', accountInfo, config).toPromise();
        console.log("INQUIRY RESULT:");
        console.log(res.data);
        const data = res.data;
        return data;
    }

    async disbursement(disbursement: OyDisbursement): Promise<OyDisbursementResponse> {
        let config = { headers: { "x-oy-username": this.configService.get("OY_USERNAME"), "x-api-key": this.configService.get("OY_APIKEY") } };
        const res = await this.httpService.post(this.configService.get("OY_ENDPOINT") + 'remit', disbursement, config).toPromise();
        console.log(res);
        const data = res.data;
        return data;
    }

    async disbursementStatus(disbursementStatus: OyDisbursementStatus): Promise<OyDisbursementStatusResponse> {
        let config = { headers: { "x-oy-username": this.configService.get("OY_USERNAME"), "x-api-key": this.configService.get("OY_APIKEY") } };
        const res = await this.httpService.post(this.configService.get("OY_ENDPOINT") + 'remit-status', disbursementStatus, config).toPromise();
        console.log(res);
        const data = res.data;
        return data;
    }

    async myBalance(): Promise<OyMyBalanceResponse> {
        let config = { headers: { "x-oy-username": this.configService.get("OY_USERNAME"), "x-api-key": this.configService.get("OY_APIKEY") } };
        const res = await this.httpService.get(this.configService.get("OY_ENDPOINT") + 'balance', config).toPromise();
        console.log(res);
        const data = res.data;
        return data;
    }

    async generateStaticVa(staticVa: OyStaticVa): Promise<OyStaticVaResponse> {
        let config = { headers: { "x-oy-username": this.configService.get("OY_USERNAME"), "x-api-key": this.configService.get("OY_APIKEY") } };
        const res = await this.httpService.post(this.configService.get("OY_ENDPOINT") + 'generate-static-va', staticVa, config).toPromise();
        console.log(res);
        const data = res.data;
        return data;
    }

    async staticVaInfo(no: string): Promise<OyStaticVAInfo> {
        let config = { headers: { "x-oy-username": this.configService.get("OY_USERNAME"), "x-api-key": this.configService.get("OY_APIKEY") } };
        const res = await this.httpService.get(this.configService.get("OY_ENDPOINT") + 'static-virtual-account/' + no, config).toPromise();
        console.log(res);
        const data = res.data;
        return data;
    }
}
