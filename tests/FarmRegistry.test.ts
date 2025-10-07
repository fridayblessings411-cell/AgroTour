import { describe, it, expect, beforeEach } from "vitest";
import { stringUtf8CV, uintCV } from "@stacks/transactions";

const ERR_NOT_AUTHORIZED = 100;
const ERR_INVALID_NAME = 101;
const ERR_INVALID_LOCATION = 102;
const ERR_INVALID_SIZE = 103;
const ERR_INVALID_CROP_TYPES = 104;
const ERR_INVALID_CERTIFICATIONS = 105;
const ERR_FARM_ALREADY_EXISTS = 106;
const ERR_FARM_NOT_FOUND = 107;
const ERR_AUTHORITY_NOT_VERIFIED = 109;
const ERR_INVALID_SUSTAINABILITY = 110;
const ERR_INVALID_FARM_TYPE = 115;
const ERR_INVALID_CAPACITY = 116;
const ERR_INVALID_CLIMATE = 117;
const ERR_INVALID_SOIL = 118;
const ERR_INVALID_CURRENCY = 119;
const ERR_MAX_FARMS_EXCEEDED = 114;
const ERR_INVALID_UPDATE_PARAM = 113;

interface Farm {
  name: string;
  location: string;
  size: number;
  cropTypes: string;
  certifications: string;
  timestamp: number;
  owner: string;
  farmType: string;
  capacity: number;
  climate: string;
  soil: string;
  currency: string;
  status: boolean;
  sustainabilityScore: number;
  maxInvestors: number;
}

interface FarmUpdate {
  updateName: string;
  updateLocation: string;
  updateSize: number;
  updateTimestamp: number;
  updater: string;
}

interface Result<T> {
  ok: boolean;
  value: T;
}

class FarmRegistryMock {
  state: {
    nextFarmId: number;
    maxFarms: number;
    registrationFee: number;
    authorityContract: string | null;
    farms: Map<number, Farm>;
    farmUpdates: Map<number, FarmUpdate>;
    farmsByName: Map<string, number>;
  } = {
    nextFarmId: 0,
    maxFarms: 1000,
    registrationFee: 1000,
    authorityContract: null,
    farms: new Map(),
    farmUpdates: new Map(),
    farmsByName: new Map(),
  };
  blockHeight: number = 0;
  caller: string = "ST1TEST";
  authorities: Set<string> = new Set(["ST1TEST"]);
  stxTransfers: Array<{ amount: number; from: string; to: string | null }> = [];

  constructor() {
    this.reset();
  }

  reset() {
    this.state = {
      nextFarmId: 0,
      maxFarms: 1000,
      registrationFee: 1000,
      authorityContract: null,
      farms: new Map(),
      farmUpdates: new Map(),
      farmsByName: new Map(),
    };
    this.blockHeight = 0;
    this.caller = "ST1TEST";
    this.authorities = new Set(["ST1TEST"]);
    this.stxTransfers = [];
  }

  isVerifiedAuthority(principal: string): Result<boolean> {
    return { ok: true, value: this.authorities.has(principal) };
  }

  setAuthorityContract(contractPrincipal: string): Result<boolean> {
    if (contractPrincipal === "SP000000000000000000002Q6VF78") {
      return { ok: false, value: false };
    }
    if (this.state.authorityContract !== null) {
      return { ok: false, value: false };
    }
    this.state.authorityContract = contractPrincipal;
    return { ok: true, value: true };
  }

  setRegistrationFee(newFee: number): Result<boolean> {
    if (!this.state.authorityContract) return { ok: false, value: false };
    this.state.registrationFee = newFee;
    return { ok: true, value: true };
  }

  createFarm(
    name: string,
    location: string,
    size: number,
    cropTypes: string,
    certifications: string,
    farmType: string,
    capacity: number,
    climate: string,
    soil: string,
    currency: string,
    sustainabilityScore: number,
    maxInvestors: number
  ): Result<number> {
    if (this.state.nextFarmId >= this.state.maxFarms) return { ok: false, value: ERR_MAX_FARMS_EXCEEDED };
    if (!name || name.length > 100) return { ok: false, value: ERR_INVALID_NAME };
    if (!location || location.length > 100) return { ok: false, value: ERR_INVALID_LOCATION };
    if (size <= 0) return { ok: false, value: ERR_INVALID_SIZE };
    if (!cropTypes) return { ok: false, value: ERR_INVALID_CROP_TYPES };
    if (certifications.length < 0) return { ok: false, value: ERR_INVALID_CERTIFICATIONS };
    if (!["organic", "conventional", "hydroponic"].includes(farmType)) return { ok: false, value: ERR_INVALID_FARM_TYPE };
    if (capacity <= 0) return { ok: false, value: ERR_INVALID_CAPACITY };
    if (!climate) return { ok: false, value: ERR_INVALID_CLIMATE };
    if (!soil) return { ok: false, value: ERR_INVALID_SOIL };
    if (!["STX", "USD", "BTC"].includes(currency)) return { ok: false, value: ERR_INVALID_CURRENCY };
    if (sustainabilityScore > 100) return { ok: false, value: ERR_INVALID_SUSTAINABILITY };
    if (maxInvestors <= 0) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (!this.isVerifiedAuthority(this.caller).value) return { ok: false, value: ERR_NOT_AUTHORIZED };
    if (this.state.farmsByName.has(name)) return { ok: false, value: ERR_FARM_ALREADY_EXISTS };
    if (!this.state.authorityContract) return { ok: false, value: ERR_AUTHORITY_NOT_VERIFIED };

    this.stxTransfers.push({ amount: this.state.registrationFee, from: this.caller, to: this.state.authorityContract });

    const id = this.state.nextFarmId;
    const farm: Farm = {
      name,
      location,
      size,
      cropTypes,
      certifications,
      timestamp: this.blockHeight,
      owner: this.caller,
      farmType,
      capacity,
      climate,
      soil,
      currency,
      status: true,
      sustainabilityScore,
      maxInvestors,
    };
    this.state.farms.set(id, farm);
    this.state.farmsByName.set(name, id);
    this.state.nextFarmId++;
    return { ok: true, value: id };
  }

  getFarm(id: number): Farm | null {
    return this.state.farms.get(id) || null;
  }

  updateFarm(id: number, updateName: string, updateLocation: string, updateSize: number): Result<boolean> {
    const farm = this.state.farms.get(id);
    if (!farm) return { ok: false, value: false };
    if (farm.owner !== this.caller) return { ok: false, value: false };
    if (!updateName || updateName.length > 100) return { ok: false, value: false };
    if (!updateLocation || updateLocation.length > 100) return { ok: false, value: false };
    if (updateSize <= 0) return { ok: false, value: false };
    if (this.state.farmsByName.has(updateName) && this.state.farmsByName.get(updateName) !== id) {
      return { ok: false, value: false };
    }

    const updated: Farm = {
      ...farm,
      name: updateName,
      location: updateLocation,
      size: updateSize,
      timestamp: this.blockHeight,
    };
    this.state.farms.set(id, updated);
    this.state.farmsByName.delete(farm.name);
    this.state.farmsByName.set(updateName, id);
    this.state.farmUpdates.set(id, {
      updateName,
      updateLocation,
      updateSize,
      updateTimestamp: this.blockHeight,
      updater: this.caller,
    });
    return { ok: true, value: true };
  }

  getFarmCount(): Result<number> {
    return { ok: true, value: this.state.nextFarmId };
  }

  checkFarmExistence(name: string): Result<boolean> {
    return { ok: true, value: this.state.farmsByName.has(name) };
  }
}

describe("FarmRegistry", () => {
  let contract: FarmRegistryMock;

  beforeEach(() => {
    contract = new FarmRegistryMock();
    contract.reset();
  });

  it("creates a farm successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.createFarm(
      "Alpha Farm",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    expect(result.ok).toBe(true);
    expect(result.value).toBe(0);

    const farm = contract.getFarm(0);
    expect(farm?.name).toBe("Alpha Farm");
    expect(farm?.location).toBe("VillageX");
    expect(farm?.size).toBe(100);
    expect(farm?.cropTypes).toBe("Wheat, Corn");
    expect(farm?.certifications).toBe("Organic Certified");
    expect(farm?.farmType).toBe("organic");
    expect(farm?.capacity).toBe(500);
    expect(farm?.climate).toBe("Temperate");
    expect(farm?.soil).toBe("Loam");
    expect(farm?.currency).toBe("STX");
    expect(farm?.sustainabilityScore).toBe(80);
    expect(farm?.maxInvestors).toBe(50);
    expect(contract.stxTransfers).toEqual([{ amount: 1000, from: "ST1TEST", to: "ST2TEST" }]);
  });

  it("rejects duplicate farm names", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createFarm(
      "Alpha Farm",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    const result = contract.createFarm(
      "Alpha Farm",
      "CityY",
      200,
      "Rice, Vegetables",
      "Fair Trade",
      "conventional",
      1000,
      "Tropical",
      "Clay",
      "USD",
      90,
      100
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_FARM_ALREADY_EXISTS);
  });

  it("rejects non-authorized caller", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.caller = "ST2FAKE";
    contract.authorities = new Set();
    const result = contract.createFarm(
      "Beta Farm",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_NOT_AUTHORIZED);
  });

  it("parses farm name with Clarity", () => {
    const cv = stringUtf8CV("Gamma Farm");
    expect(cv.value).toBe("Gamma Farm");
  });

  it("rejects farm creation without authority contract", () => {
    const result = contract.createFarm(
      "NoAuth Farm",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_AUTHORITY_NOT_VERIFIED);
  });

  it("rejects invalid size", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.createFarm(
      "InvalidSize",
      "VillageX",
      0,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_SIZE);
  });

  it("rejects invalid farm type", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.createFarm(
      "InvalidType",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "invalid",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_FARM_TYPE);
  });

  it("updates a farm successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createFarm(
      "Old Farm",
      "Old Location",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    const result = contract.updateFarm(0, "New Farm", "New Location", 200);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const farm = contract.getFarm(0);
    expect(farm?.name).toBe("New Farm");
    expect(farm?.location).toBe("New Location");
    expect(farm?.size).toBe(200);
    const update = contract.state.farmUpdates.get(0);
    expect(update?.updateName).toBe("New Farm");
    expect(update?.updateLocation).toBe("New Location");
    expect(update?.updateSize).toBe(200);
    expect(update?.updater).toBe("ST1TEST");
  });

  it("rejects update for non-existent farm", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.updateFarm(99, "New Farm", "New Location", 200);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("rejects update by non-owner", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createFarm(
      "Test Farm",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    contract.caller = "ST3FAKE";
    const result = contract.updateFarm(0, "New Farm", "New Location", 200);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("sets registration fee successfully", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.setRegistrationFee(2000);
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.registrationFee).toBe(2000);
    contract.createFarm(
      "Test Farm",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    expect(contract.stxTransfers).toEqual([{ amount: 2000, from: "ST1TEST", to: "ST2TEST" }]);
  });

  it("rejects registration fee change without authority contract", () => {
    const result = contract.setRegistrationFee(2000);
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });

  it("returns correct farm count", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createFarm(
      "Farm1",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    contract.createFarm(
      "Farm2",
      "CityY",
      200,
      "Rice, Vegetables",
      "Fair Trade",
      "conventional",
      1000,
      "Tropical",
      "Clay",
      "USD",
      90,
      100
    );
    const result = contract.getFarmCount();
    expect(result.ok).toBe(true);
    expect(result.value).toBe(2);
  });

  it("checks farm existence correctly", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.createFarm(
      "Test Farm",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    const result = contract.checkFarmExistence("Test Farm");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    const result2 = contract.checkFarmExistence("NonExistent");
    expect(result2.ok).toBe(true);
    expect(result2.value).toBe(false);
  });

  it("parses farm parameters with Clarity types", () => {
    const name = stringUtf8CV("Test Farm");
    const size = uintCV(100);
    const sustainability = uintCV(80);
    expect(name.value).toBe("Test Farm");
    expect(size.value).toEqual(BigInt(100));
    expect(sustainability.value).toEqual(BigInt(80));
  });

  it("rejects farm creation with empty name", () => {
    contract.setAuthorityContract("ST2TEST");
    const result = contract.createFarm(
      "",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_INVALID_NAME);
  });

  it("rejects farm creation with max farms exceeded", () => {
    contract.setAuthorityContract("ST2TEST");
    contract.state.maxFarms = 1;
    contract.createFarm(
      "Farm1",
      "VillageX",
      100,
      "Wheat, Corn",
      "Organic Certified",
      "organic",
      500,
      "Temperate",
      "Loam",
      "STX",
      80,
      50
    );
    const result = contract.createFarm(
      "Farm2",
      "CityY",
      200,
      "Rice, Vegetables",
      "Fair Trade",
      "conventional",
      1000,
      "Tropical",
      "Clay",
      "USD",
      90,
      100
    );
    expect(result.ok).toBe(false);
    expect(result.value).toBe(ERR_MAX_FARMS_EXCEEDED);
  });

  it("sets authority contract successfully", () => {
    const result = contract.setAuthorityContract("ST2TEST");
    expect(result.ok).toBe(true);
    expect(result.value).toBe(true);
    expect(contract.state.authorityContract).toBe("ST2TEST");
  });

  it("rejects invalid authority contract", () => {
    const result = contract.setAuthorityContract("SP000000000000000000002Q6VF78");
    expect(result.ok).toBe(false);
    expect(result.value).toBe(false);
  });
});